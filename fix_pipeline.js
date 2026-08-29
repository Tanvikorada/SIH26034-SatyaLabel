const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      const ocrResult = await runOcrPipeline(imagePath, metadata.forceEngine);
  
      if (!ocrResult) {
        await batch.update({ status: 'failed' });
        return;
      }
      
      let productsArray = ocrResult.structuredData?.products || ocrResult.structuredData;
      if (!Array.isArray(productsArray)) {
        productsArray = [productsArray];
      }
      
      let successfulScans = 0;
      for (const rawProductData of productsArray) {
        if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
        
        try {`;

const replace = `      const { detectAndCropProducts } = require('../services/crop_service');
      console.log('[Pipeline] Starting pipeline for Batch', batch.id);
      
      const imagePaths = await detectAndCropProducts(imagePath);
      let successfulScans = 0;
      
      for (const cropPath of imagePaths) {
        const ocrResult = await runOcrPipeline(cropPath, metadata.forceEngine);
        if (!ocrResult) continue;
        
        let productsArray = ocrResult.structuredData?.products || ocrResult.structuredData;
        if (!Array.isArray(productsArray)) productsArray = [productsArray];
        
        // Take only the first product since we cropped the image down to a single product context
        const rawProductData = productsArray[0];
        if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
        
        try {`;

// Standardize line endings for matching
if (js.includes(target.replace(/\r\n/g, '\n'))) {
  js = js.replace(target.replace(/\r\n/g, '\n'), replace);
} else {
  js = js.replace(target, replace);
}

// We also need to add a closing brace for the `for (const cropPath of imagePaths)` loop
const endTarget = `        successfulScans++;
      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }
    }

    if (successfulScans > 0) {`;

const endReplace = `        successfulScans++;
        } catch (innerErr) {
          global.lastInnerErr = innerErr.stack || innerErr.message;
          console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
          require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
        }
      }

      if (successfulScans > 0) {`;

// Note: I actually don't need to add a closing brace if I am just replacing `for (const rawProductData of productsArray)` 
// with `for (const cropPath of imagePaths) {` because it maps 1:1 with the closing braces!
