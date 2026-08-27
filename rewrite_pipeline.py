import re

with open("backend/routes/scans.js", "r", encoding="utf-8") as f:
    js = f.read()

# Replace runScanPipeline with runBatchPipeline
new_pipeline = """async function runBatchPipeline(batch, imagePath, metadata = {}) {
  try {
    const { Scan, Product, Violation, Report, Batch } = require('../models');
    const { runOcrPipeline } = require('../services/ocr_service');
    const { extractFields } = require('../services/extraction_service');
    const { validateCompliance } = require('../services/rules_engine');
    const { generateReport } = require('../services/report_service');
    const { generateAIAuditorAnalysis } = require('../services/auditor_service');

    console.log(`[Pipeline] Starting pipeline for Batch ${batch.id}`);
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

      // Check if image quality is explicitly bad (hallucination guardrail)
      if (rawProductData.meta_image_quality && rawProductData.meta_image_quality !== 'good') {
         fieldsMap._quality_warning = rawProductData.meta_quality_reason || 'Image quality too poor for full verification.';
      }
      if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
         fieldsMap._quality_warning = (fieldsMap._quality_warning || '') + ' Obstruction detected: ' + rawProductData.meta_obstruction;
      }

      const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);
      
      console.log("[Pipeline] Generating AI Auditor reasoning...");
      const aiAnalysis = await generateAIAuditorAnalysis(fieldsMap, violations, ocrResult.text);
      if (aiAnalysis) {
        fieldsMap._ai_analysis = aiAnalysis;
      }

      const productName = fieldsMap.product_name || batch.productNameHint || 'Unknown Product';
      const brandName   = fieldsMap.brand_name   || batch.brandNameHint   || null;
      let product = null;

      if (productName === 'Unknown Product') {
        product = await Product.create({ productName, brandName, category: inferCategory(fieldsMap) });
      } else if (productName) {
        [product] = await Product.findOrCreate({
          where: { productName },
          defaults: { productName, brandName, category: inferCategory(fieldsMap) },
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
      const reportPath = await generateReport({
        scan: scan.toJSON(),
        product: product?.toJSON() || null,
        extractedFields: fieldsMap,
        violations: violationsToSave,
        stats,
      }, require('path').join(__dirname, '../uploads'));

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
    console.error(`[Pipeline] Fatal error processing batch ${batch.id}:`, err);
    await batch.update({ status: 'failed' }).catch(() => {});
  }
}
"""

js = re.sub(r'async function runScanPipeline\(scan, imagePath, metadata = \{\}\) \{.*?// ─── ROUTES ────────────────────────────────────────────────────────────────', new_pipeline + '\n// ─── ROUTES ────────────────────────────────────────────────────────────────', js, flags=re.DOTALL)

with open("backend/routes/scans.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Pipeline rewritten")
