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


// Temporary debug route to test OCR natively
router.get('/debug-ocr', async (req, res) => {
  try {
    const { runOcrPipeline } = require('../services/ocr_service');
    // Create a tiny 1x1 image to test just the API connection
    const fs = require('fs');
    const tinyImagePath = './tiny.jpg';
    // 1x1 white pixel in base64
    const tinyBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    fs.writeFileSync(tinyImagePath, Buffer.from(tinyBase64, 'base64'));
    
    const start = Date.now();
    const result = await runOcrPipeline(tinyImagePath, {});
    const elapsed = Date.now() - start;
    
    res.json({ success: true, elapsed, result });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});


// Temporary debug route to list models
router.get('/debug-models', async (req, res) => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://omkjlsjazonebqiqvqlb.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta2psc2phem9uZWJxaXF2cWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDY0MjYsImV4cCI6MjEwMTQ4MjQyNn0.kKVFlQk8EF_XMqFRaglmaPYY-lvtILB6jq2Iqu02s5Y'
);

const upload = require('../middleware/upload');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const { Scan, Product, Violation, Report, User } = require('../models');
const { runOcrPipeline } = require('../services/ocr_service');
const { extractFields } = require('../services/extraction_service');
const { validateCompliance } = require('../services/rules_engine');
const { generateReport } = require('../services/report_service');
const { generateAIAuditorAnalysis } = require('../services/auditor_service');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Spec 05 success envelope
const ok = (res, data, status = 200) => res.status(status).json({ data });

// Spec 05 error envelope
const fail = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } });

// Rules engine status → DB status
// Blueprint 5-status: PASS, POTENTIAL NON-COMPLIANCE, MANUAL REVIEW, NOT APPLICABLE, NOT VERIFIED
// These are stored as-is in the DB. No translation needed.
function toDbStatus(engineStatus) {
  return engineStatus; // Store blueprint statuses directly
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

async function runBatchPipeline(batch, imagePath, metadata = {}) {
  try {
    const { Scan, Product, Violation, Report, Batch } = require('../models');
    const { runOcrPipeline } = require('../services/ocr_service');
    const { extractFields } = require('../services/extraction_service');
    const { validateCompliance } = require('../services/rules_engine');
    const { generateReport } = require('../services/report_service');
    const { generateAIAuditorAnalysis } = require('../services/auditor_service');

    console.log('[Pipeline] Starting pipeline for Batch', batch.id);
    const ocrResult = await runOcrPipeline(imagePath, metadata.forceEngine);

    if (!ocrResult.success) {
      await batch.update({ status: 'failed' });
      return;
    }

    let productsArray = ocrResult.geminiStructuredData;
    if (!Array.isArray(productsArray)) {
      productsArray = [productsArray];
    }

    for (const rawProductData of productsArray) {
      if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
      
      const fieldsMap = extractFields(
        ocrResult.text,
        rawProductData,
        ocrResult._fontMetrics || null
      );

      if (rawProductData.meta_image_quality && rawProductData.meta_image_quality !== 'good') {
         fieldsMap._quality_warning = rawProductData.meta_quality_reason || 'Image quality too poor for full verification.';
      }
      if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
         fieldsMap._quality_warning = (fieldsMap._quality_warning || '') + ' Obstruction detected: ' + rawProductData.meta_obstruction;
      }

      const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);
      
      const aiAnalysis = await generateAIAuditorAnalysis(fieldsMap, violations, ocrResult.text);
      if (aiAnalysis) {
        fieldsMap._ai_analysis = aiAnalysis;
      }

      const productName = fieldsMap.product_name || batch.productNameHint || 'Unknown Product';
      const brandName   = fieldsMap.brand_name   || batch.brandNameHint   || null;
      let product = null;

      if (productName === 'Unknown Product') {
        product = await Product.create({ productName, brandName, category: 'general' });
      } else if (productName) {
        [product] = await Product.findOrCreate({
          where: { productName },
          defaults: { productName, brandName, category: 'general' },
        });
        if (brandName && !product.brandName) await product.update({ brandName });
      }

      const scan = await Scan.create({
        batchId:          batch.id,
        imagePath:        batch.originalImage,
        uploadedBy:       batch.uploadedBy,
        sourceType:       batch.sourceType,
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

      const violationsToSave = results || violations;
      const reportDir = require('path').join(__dirname, '../uploads');
      const reportPath = await generateReport({
        scan: scan.toJSON(),
        product: product?.toJSON() || null,
        extractedFields: fieldsMap,
        violations: violationsToSave,
        stats,
      }, reportDir);

      await Report.create({ scanId: scan.id, filePath: reportPath, generatedBy: scan.uploadedBy || null });

      for (const v of violationsToSave) {
        await Violation.create({
          scanId: scan.id,
          ruleId: v.ruleId,
          ruleTitle: v.ruleTitle,
          status: v.status,
          affectedField: v.affectedField,
          severity: v.severity,
          detail: v.detail,
          confidence: v.confidence || 'estimated',
        });
      }
    }

    await batch.update({ status: 'completed' });

  } catch (err) {
    console.error('[Pipeline] Fatal error processing batch', batch.id, err);
    await batch.update({ status: 'failed' }).catch(() => {});
  }
}
// OLD:// ─── POST /api/v1/scans ───────────────────────────────────────────────────────
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
        // 1. Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileName = `${Date.now()}_${path.basename(req.file.originalname)}`;
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('uploads')
          .upload(fileName, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        let cloudUrl = req.file.path; // fallback
        if (!uploadError) {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          cloudUrl = data.publicUrl;
        }

        const { Batch } = require('../models');
        const batch = await Batch.create({
          originalImage:    cloudUrl,
          uploadedBy:       req.user?.id || null,
          status:           'processing',
        });
        batch.productNameHint = productNameHint;
        batch.brandNameHint   = brandNameHint;
        batch.sourceType      = sourceType;

        ok(res, { batch_id: batch.id, status: 'processing' }, 202);

        setImmediate(() => runBatchPipeline(batch, req.file.path, { forceEngine: req.body.forceEngine }));

      } catch (err) {
      return fail(res, 500, 'INTERNAL_ERROR', err.message);
    }
  });
});

// ─── GET /api/v1/scans/batch/:id ────────────────────────────────────────────────────────
router.get('/batch/:id', optionalAuth, async (req, res) => {
  try {
    const { Batch, Scan, Product } = require('../models');
    const batch = await Batch.findByPk(req.params.id, {
      include: [{ 
        model: Scan, 
        as: 'scans',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!batch) return fail(res, 404, 'BATCH_NOT_FOUND', 'Batch not found');

    const formattedScans = (batch.scans || []).map(formatScanSummary);
    
    ok(res, {
      id: batch.id,
      status: batch.status,
      original_image: batch.originalImage,
      scans: formattedScans
    });
  } catch (err) {
    fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
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
    product_name: scan.product?.productName || (scan.extractedData ? scan.extractedData.product_name : null) || null,
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
    // Violations — spec 05 shape with blueprint 5-status
    violations: (scan.violations || []).map(v => ({
      id:          v.id,
      rule_id:     v.ruleId,
      ruleId:      v.ruleId,
      rule_title:  v.ruleTitle,
      ruleTitle:   v.ruleTitle,
      status:      v.status,
      field:       v.affectedField,
      affectedField: v.affectedField,
      severity:    v.severity,
      detail:      v.detail,
      confidence:  v.confidence,
      
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

// Temporary debug route to list models
router.get('/debug-models', async (req, res) => {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST /api/v1/scans/:id/cancel
router.post('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const scan = await Scan.findByPk(req.params.id);
    if (!scan) return fail(res, 404, 'SCAN_NOT_FOUND', 'Scan not found');
    
    if (scan.status === 'processing') {
      await scan.update({ status: 'failed', errorMessage: 'Scan cancelled by user.' });
      return ok(res, { message: 'Scan cancelled successfully' });
    }
    
    return ok(res, { message: 'Scan already finished' });
  } catch (err) {
    return fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

module.exports = router;
