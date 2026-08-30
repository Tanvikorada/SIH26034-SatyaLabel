const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const searchStart = 'async function runBatchPipeline(batch, imagePath, metadata = {}) {';
const searchEnd = '  // OLD://';

const startIndex = js.indexOf(searchStart);
const endIndex = js.indexOf(searchEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newFunction = `async function runBatchPipeline(batch, imagePath, metadata = {}) {
    try {
      const { Scan, Product, Violation, Report, Batch } = require('../models');
      const { runOcrPipeline } = require('../services/ocr_service');
      const { extractFields } = require('../services/extraction_service');
      const { validateCompliance } = require('../services/rules_engine');
    
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      
      const filePathsArray = Array.isArray(imagePath) ? imagePath : [imagePath];
      
      const ocrResult = await runOcrPipeline(filePathsArray, metadata.forceEngine);
      if (!ocrResult) {
        await batch.update({ status: 'failed', errorMessage: 'We could not extract any text from this image. Please ensure the label is clearly visible and try again.' });
        return;
      }
      
      let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;
      if (!Array.isArray(productsArray)) productsArray = [productsArray];
      
      if (productsArray.length > 1) {
        await batch.update({ 
          status: 'failed', 
          errorMessage: 'Multiple products detected. For a legal compliance audit, please photograph only ONE product at a time to maintain a clear chain of evidence.' 
        });
        return;
      }
      
      const rawProductData = productsArray[0];
      if (!rawProductData || Object.keys(rawProductData).length === 0) {
        await batch.update({ status: 'failed', errorMessage: 'No consumer packaging found.' });
        return;
      }
      
      const fieldsMap = extractFields(
        ocrResult.text,
        rawProductData,
        ocrResult._fontMetrics || null
      );

      if (rawProductData.meta_image_quality && rawProductData.meta_image_quality !== 'good') {
         fieldsMap._quality_warning = rawProductData.meta_quality_reason || 'Image quality too poor for full verification.';
      }
      if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
         let reason = rawProductData.meta_obstruction;
         if (reason === 'partially_cut_off') reason = 'Curved surface / Edge cut off. Take multiple photos for full validation.';
         fieldsMap._quality_warning = reason;
      }

      const complianceResults = await validateCompliance(fieldsMap, ocrResult.text, {
        productNameHint: batch.productNameHint,
        brandNameHint: batch.brandNameHint,
        sourceType: batch.sourceType,
      });

      const { compliant, nonCompliant, manualReview, notApplicable, notVerified } = complianceResults.stats;
      let finalStatus = 'compliant';
      if (nonCompliant > 0) finalStatus = 'non_compliant';
      else if (manualReview > 0 || notVerified > 0) finalStatus = 'manual_review';

      let dbImage = batch.originalImage;
      try { dbImage = JSON.parse(batch.originalImage)[0]; } catch(e){}

      const scan = await Scan.create({
        batchId:          batch.id,
        imagePath:        dbImage,
        status:           finalStatus,
        complianceScore:  complianceResults.stats.score,
        extractedFields:  fieldsMap,
        rawOcrText:       ocrResult.text,
        ocrEngine:        ocrResult.engine,
        ocrConfidence:    ocrResult.confidenceAvg,
      });

      const prod = await Product.create({
        scanId: scan.id,
        name: rawProductData.product_name || batch.productNameHint || 'Unknown Product',
        brand: rawProductData.brand_name || batch.brandNameHint || null,
        category: rawProductData.category || 'General',
      });

      for (const v of complianceResults.results) {
        await Violation.create({
          scanId: scan.id,
          ruleId: v.rule_id,
          ruleTitle: v.rule_title,
          fieldCategory: v.field,
          severity: v.severity || 'low',
          description: v.detail || 'Failed check',
          status: v.status,
          confidence: v.confidence || 'estimated',
        });
      }

      await batch.update({ status: 'completed' });
      
      const clients = batchClients.get(String(batch.id)) || [];
      clients.forEach(clientRes => {
        clientRes.write(\`data: \${JSON.stringify({ status: batch.status })}\\n\\n\`);
        clientRes.end();
      });
      batchClients.delete(String(batch.id));

    } catch (err) {
      console.error('[Pipeline] Fatal error processing batch', batch.id, err);
      require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
      await batch.update({ status: 'failed' }).catch(() => {});
    }
  }
`;

  js = js.substring(0, startIndex) + newFunction + js.substring(endIndex);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Successfully replaced runBatchPipeline!");
} else {
  console.log("Could not find start or end index.", startIndex, endIndex);
}
