const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `  async function runBatchPipeline(batch, imagePath, metadata = {}) {
    try {
      const { Scan, Product, Violation, Report, Batch } = require('../models');
      const { runOcrPipeline } = require('../services/ocr_service');
      const { extractFields } = require('../services/extraction_service');
      const { validateCompliance } = require('../services/rules_engine');
      const { generateReport } = require('../services/report_service');
      const { generateAIAuditorAnalysis } = require('../services/auditor_service');
  
      const { detectAndCropProducts } = require('../services/crop_service');
    
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      
      const imagePaths = await detectAndCropProducts(imagePath);
      let successfulScans = 0;
      
      for (const cropPath of imagePaths) {
        const ocrResult = await runOcrPipeline(cropPath, metadata.forceEngine);
        if (!ocrResult) continue;
        
        let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;
        if (!Array.isArray(productsArray)) productsArray = [productsArray];
        
        for (const rawProductData of productsArray) {
          if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
          
          try {`;

const replacement = `  async function runBatchPipeline(batch, imagePath, metadata = {}) {
    try {
      const { Scan, Product, Violation, Report, Batch } = require('../models');
      const { runOcrPipeline } = require('../services/ocr_service');
      const { extractFields } = require('../services/extraction_service');
      const { validateCompliance } = require('../services/rules_engine');
      const { generateReport } = require('../services/report_service');
      const { generateAIAuditorAnalysis } = require('../services/auditor_service');
  
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      
      const ocrResult = await runOcrPipeline(imagePath, metadata.forceEngine);
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
      
      let successfulScans = 0;
      
      try {`;

if (js.includes(target.replace(/\r\n/g, '\n'))) {
  js = js.replace(target.replace(/\r\n/g, '\n'), replacement);
} else {
  js = js.replace(target, replacement);
}

// And fix the end braces!
const targetEnd = `          successfulScans++;
          } catch (innerErr) {
            global.lastInnerErr = innerErr.stack || innerErr.message;
            console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
            require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
          }
        } // close productsArray loop
      }`;

const replaceEnd = `        successfulScans++;
      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }`;

if (js.includes(targetEnd.replace(/\r\n/g, '\n'))) {
  js = js.replace(targetEnd.replace(/\r\n/g, '\n'), replaceEnd);
} else {
  js = js.replace(targetEnd, replaceEnd);
}

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Reverted scans.js to single product rejection!");
