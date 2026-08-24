// backend/routes/scans.js
// ============================================================
// Scan routes — Spec 05 API
// Base: /api/v1/scans
//
// KEY CHANGE (spec 05): POST /scans is now ASYNC.
//   1. Accept upload + create DB record → return 202 immediately
//   2. Run OCR/extraction/rules pipeline in background
//   3. Frontend polls GET /scans/:id every 2s until status !== "processing"
//
// Response envelope: { data: {...} } for success (spec 05 convention)
// Error envelope: { error: { code, message } } (spec 05 convention)
// ============================================================

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const upload = require('../middleware/upload');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const { Scan, Product, Violation, Report, User } = require('../models');
const { runOcrPipeline } = require('../services/ocr_service');
const { extractFields } = require('../services/extraction_service');
const { validateCompliance } = require('../services/rules_engine');
const { generateReport } = require('../services/report_service');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Spec 05 success envelope
const ok = (res, data, status = 200) => res.status(status).json({ data });

// Spec 05 error envelope
const fail = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } });

// Rules engine 'estimated' → DB 'estimated_fail'
function toDbStatus(engineStatus) {
  return engineStatus === 'estimated' ? 'estimated_fail' : engineStatus;
}

// Infer product category from extracted fields
function inferCategory(fieldsMap) {
  if (fieldsMap.fssai_license || fieldsMap.ingredients) return 'food';
  if (/pharma|tablet|capsule|syrup/i.test(JSON.stringify(fieldsMap))) return 'pharma';
  if (/cosmetic|cream|lotion|shampoo/i.test(JSON.stringify(fieldsMap))) return 'cosmetics';
  return 'general';
}

// ─── ASYNC PIPELINE ───────────────────────────────────────────────────────────
// Runs AFTER the HTTP response has been sent (fire-and-forget from route handler).
// Updates the scan record with results when complete.

async function runScanPipeline(scan, imagePath, sourceType) {
  try {
    // Step 1: OCR
    const ocrResult = await runOcrPipeline(path.resolve(imagePath));

    // Step 2: Extract fields (two-tier: regex → Gemini)
    const fieldsMap = extractFields(
      ocrResult.text,
      ocrResult.geminiStructuredData || null,
      ocrResult._fontMetrics || null
    );

    // Step 3: Rules engine
    const { violations, stats } = validateCompliance(fieldsMap, ocrResult.text, {
      source_type: sourceType,
    });

    // Step 4: Find or create Product
    const productName = fieldsMap.product_name || scan.productNameHint || null;
    const brandName   = fieldsMap.brand_name   || scan.brandNameHint   || null;
    let product = null;

    if (productName) {
      [product] = await Product.findOrCreate({
        where: { productName },
        defaults: { productName, brandName, category: inferCategory(fieldsMap) },
      });
    }

    // Step 5: Update scan with results
    await scan.update({
      productId:        product?.id || null,
      ocrRawText:       ocrResult.text,
      ocrEngineUsed:    ocrResult.engine,
      ocrConfidenceAvg: ocrResult.confidence,
      extractedFields:  fieldsMap,
      overallCompliance: stats.overallCompliance,
      complianceScore:  stats.complianceScore,
      totalRulesChecked: stats.totalRulesChecked,
      totalViolations:  stats.totalViolations,
      highViolations:   stats.highViolations,
      status:           'complete',
    });

    // Step 6: Save violations (fail + estimated_fail only)
    const violationsToSave = violations.filter(v => v.status !== 'pass');
    if (violationsToSave.length > 0) {
      await Violation.bulkCreate(
        violationsToSave.map(v => ({
          scanId:       scan.id,
          ruleId:       v.rule_id,
          ruleTitle:    v.rule_title,
          status:       toDbStatus(v.status),
          affectedField: v.field,
          severity:     v.severity,
          detail:       v.detail,
          confidence:   v.confidence,
        }))
      );
    }

    // Step 7: Generate PDF report
    const reportDir = './reports';
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const reportPath = await generateReport({
      scan: scan.toJSON(),
      product: product?.toJSON() || null,
      extractedFields: fieldsMap,
      violations: violationsToSave,
      stats,
    }, reportDir);

    await Report.create({
      scanId:      scan.id,
      filePath:    reportPath,
      generatedBy: scan.uploadedBy || null,
    });

    console.log(`[Pipeline] ✅ Scan ${scan.id.slice(0, 8)} complete — ${stats.overallCompliance}`);

  } catch (err) {
    console.error(`[Pipeline] ❌ Scan ${scan.id.slice(0, 8)} failed:`, err.message);

    let errorMessage = err.message;
    if (err.code === 'IMAGE_TOO_LOW_RES') {
      errorMessage = `Image resolution too low. ${err.message}`;
    } else if (err.code === 'NO_TEXT_DETECTED') {
      errorMessage = 'No readable text detected. Try better lighting or closer framing.';
    }

    await scan.update({ status: 'failed', errorMessage }).catch(() => {});
  }
}

// ─── POST /api/v1/scans ───────────────────────────────────────────────────────
// Spec 05: Returns 202 immediately. Pipeline runs async.
// Client polls GET /scans/:id until status !== "processing".
//
// Multipart body:
//   image        — file (JPG/PNG, max 10MB)
//   source_type  — "physical_label" | "ecommerce_listing"
//   product_name — optional hint (used if OCR misses it)
//   brand_name   — optional hint
router.post('/', optionalAuth, (req, res, next) => {
  // Run multer first, then handle in callback to send 202 before pipeline
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return fail(res, 413, 'FILE_TOO_LARGE', 'File too large — maximum 10MB.');
      }
      if (uploadErr.code === 'INVALID_FILE_TYPE') {
        return fail(res, 400, 'INVALID_FILE_TYPE', uploadErr.message);
      }
      return fail(res, 400, 'UPLOAD_ERROR', uploadErr.message);
    }

    if (!req.file) {
      return fail(res, 400, 'MISSING_IMAGE', 'No image file uploaded — include field "image".');
    }

    const sourceType    = req.body.source_type || 'physical_label';
    const productNameHint = req.body.product_name || null;
    const brandNameHint   = req.body.brand_name   || null;

    // Validate source_type
    if (!['physical_label', 'ecommerce_listing'].includes(sourceType)) {
      return fail(res, 400, 'INVALID_SOURCE_TYPE',
        'source_type must be "physical_label" or "ecommerce_listing"');
    }

    try {
      // Create scan record immediately (status = processing)
      const scan = await Scan.create({
        imagePath:        req.file.path,
        originalFilename: req.file.originalname,
        uploadedBy:       req.user?.id || null,
        sourceType,
        status:           'processing',
        // Store hints for pipeline (non-schema cols, used transiently)
      });

      // Store hints on object for pipeline (not in DB schema)
      scan.productNameHint = productNameHint;
      scan.brandNameHint   = brandNameHint;

      // ── Return 202 IMMEDIATELY (spec 05) ─────────────────────────────────
      // Frontend polls GET /scans/:id every 2s until status !== "processing"
      ok(res, { scan_id: scan.id, status: 'processing' }, 202);

      // ── Fire pipeline async (after response sent) ─────────────────────────
      setImmediate(() => runScanPipeline(scan, req.file.path, sourceType));

    } catch (err) {
      return fail(res, 500, 'INTERNAL_ERROR', err.message);
    }
  });
});

// ─── GET /api/v1/scans ───────────────────────────────────────────────────────
// Spec 05 query params: ?compliance=non_compliant&search=<name>&page=&limit=
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { compliance, search, status: statusFilter } = req.query;
    const { Op } = require('sequelize');

    const where = {};
    if (statusFilter)  where.status = statusFilter;
    if (compliance) where.overallCompliance = compliance;

    const productInclude = {
      model: Product,
      as: 'product',
      required: false,
    };

    if (search) {
      productInclude.where = {
        [Op.or]: [
          { productName: { [Op.iLike]: `%${search}%` } },
          { brandName:   { [Op.iLike]: `%${search}%` } },
        ],
      };
      productInclude.required = true;
    }

    const { count, rows } = await Scan.findAndCountAll({
      where,
      include: [productInclude],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    ok(res, {
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
      scans: rows.map(formatScanSummary),
    });

  } catch (err) {
    fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// ─── GET /api/v1/scans/:id ───────────────────────────────────────────────────
// Spec 05 full response shape:
// { id, status, image_url, source_type, extracted_fields, overall_compliance,
//   violations: [...], created_at }
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const scan = await Scan.findByPk(req.params.id, {
      include: [
        { model: Product,   as: 'product' },
        { model: Violation, as: 'violations' },
        { model: Report,    as: 'reports' },
      ],
    });

    if (!scan) return fail(res, 404, 'SCAN_NOT_FOUND', `No scan found with id ${req.params.id}`);

    ok(res, formatScanFull(scan));

  } catch (err) {
    fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// ─── DELETE /api/v1/scans/:id ─────────────────────────────────────────────────
// Spec 05: admin only
router.delete('/:id', optionalAuth, async (req, res) => {
  // Admin check — fail gracefully in demo mode if no auth
  if (req.user && req.user.role !== 'admin') {
    return fail(res, 403, 'FORBIDDEN', 'Only admins can delete scans.');
  }

  try {
    const scan = await Scan.findByPk(req.params.id);
    if (!scan) return fail(res, 404, 'SCAN_NOT_FOUND', `No scan found with id ${req.params.id}`);

    // Clean up image file
    if (scan.imagePath && fs.existsSync(scan.imagePath)) {
      try { fs.unlinkSync(scan.imagePath); } catch (_) {}
    }

    await scan.destroy(); // Cascades to violations + reports (ON DELETE CASCADE)
    ok(res, { deleted: true, scan_id: req.params.id });

  } catch (err) {
    fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// ─── RESPONSE FORMATTERS ─────────────────────────────────────────────────────

function formatScanSummary(scan) {
  return {
    id: scan.id,
    status: scan.status,
    source_type: scan.sourceType,
    overall_compliance: scan.overallCompliance,
    compliance_score: scan.complianceScore,
    total_violations: scan.totalViolations,
    high_violations: scan.highViolations,
    product_name: scan.product?.productName || null,
    brand_name: scan.product?.brandName || null,
    ocr_engine: scan.ocrEngineUsed,
    created_at: scan.created_at,
  };
}

function formatScanFull(scan) {
  return {
    id: scan.id,
    status: scan.status,
    // image_url: relative path usable by frontend to display thumbnail
    image_url: scan.imagePath ? `/uploads/${path.basename(scan.imagePath)}` : null,
    source_type: scan.sourceType,
    overall_compliance: scan.overallCompliance,
    // overallStatus alias for frontend backward compat
    overallStatus: scan.overallCompliance,
    compliance_score: scan.complianceScore,
    total_rules_checked: scan.totalRulesChecked,
    total_violations: scan.totalViolations,
    high_violations: scan.highViolations,
    ocr_engine_used: scan.ocrEngineUsed,
    ocr_confidence_avg: scan.ocrConfidenceAvg,
    // JSONB extracted fields (spec 03)
    extracted_fields: scan.extractedFields,
    extractedFields:  scan.extractedFields,   // camelCase alias
    ocr_raw_text: scan.ocrRawText,
    error_message: scan.errorMessage || null,
    // Nested product (may be null for failed/processing scans)
    product: scan.product ? {
      id: scan.product.id,
      product_name: scan.product.productName,
      brand_name:   scan.product.brandName,
      category:     scan.product.category,
    } : null,
    // Violations — spec 05 shape exactly
    violations: (scan.violations || []).map(v => ({
      id:         v.id,
      rule_id:    v.ruleId,
      ruleId:     v.ruleId,    // camelCase alias
      rule_title: v.ruleTitle,
      ruleTitle:  v.ruleTitle,
      status:     v.status,    // 'fail' | 'estimated_fail' | 'pass'
      field:      v.affectedField,
      affectedField: v.affectedField,
      severity:   v.severity,
      detail:     v.detail,
      confidence: v.confidence,
    })),
    // Latest report (if generated)
    report: scan.reports?.[0] ? {
      id:        scan.reports[0].id,
      file_url:  `/api/v1/reports/${scan.id}/download`,
      created_at: scan.reports[0].created_at,
    } : null,
    created_at: scan.created_at,
  };
}

// ─── POST /api/v1/scans/:id/report ───────────────────────────────────────────────────
// Spec 05: Generates / returns PDF report for a completed scan.
// Returns: { data: { report_id, file_url } }
router.post('/:id/report', optionalAuth, async (req, res) => {
  try {
    const scan = await Scan.findByPk(req.params.id, {
      include: [
        { model: Product,   as: 'product' },
        { model: Violation, as: 'violations' },
        { model: Report,    as: 'reports' },
      ],
    });

    if (!scan) return fail(res, 404, 'SCAN_NOT_FOUND', `Scan ${req.params.id} not found`);

    if (scan.status !== 'complete') {
      return fail(res, 400, 'SCAN_NOT_COMPLETE',
        `Cannot generate report — scan status is "${scan.status}". Poll until status is "complete".`);
    }

    // Return existing report if file still present
    const existingReport = scan.reports?.[0];
    if (existingReport && fs.existsSync(existingReport.filePath)) {
      return ok(res, {
        report_id:  existingReport.id,
        file_url:   `/api/v1/reports/${existingReport.id}/download`,
        created_at: existingReport.created_at,
      });
    }

    // Generate PDF
    const reportDir = './reports';
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const reportPath = await generateReport({
      scan:            scan.toJSON(),
      product:         scan.product?.toJSON() || null,
      extractedFields: scan.extractedFields || {},
      violations:      scan.violations || [],
      stats: {
        totalRulesChecked: scan.totalRulesChecked,
        totalViolations:   scan.totalViolations,
        highViolations:    scan.highViolations,
        complianceScore:   scan.complianceScore,
        overallCompliance: scan.overallCompliance,
      },
    }, reportDir);

    let report;
    if (existingReport) {
      await existingReport.update({ filePath: reportPath });
      report = existingReport;
    } else {
      report = await Report.create({
        scanId:      scan.id,
        filePath:    reportPath,
        generatedBy: req.user?.id || null,
      });
    }

    ok(res, {
      report_id:  report.id,
      file_url:   `/api/v1/reports/${report.id}/download`,
      created_at: report.created_at,
    }, 201);

  } catch (err) {
    console.error('[POST /scans/:id/report]', err.message);
    fail(res, 500, 'REPORT_GENERATION_FAILED', err.message);
  }
});

module.exports = router;
