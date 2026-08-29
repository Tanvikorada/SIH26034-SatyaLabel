const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const regex = /let successfulScans = 0;\s*const ocrResult = await runOcrPipeline\(imagePath, metadata\.forceEngine\);\s*if \(ocrResult\) \{\s*const cropPath = imagePath\[0\] \|\| imagePath; \/\/ just for the thumbnail\s*const ocrResult = await runOcrPipeline\(cropPath, metadata\.forceEngine\);\s*if \(\!ocrResult\) continue;\s*let productsArray = ocrResult\.geminiStructuredData\?\.products \|\| ocrResult\.geminiStructuredData;\s*if \(\!Array\.isArray\(productsArray\)\) productsArray = \[productsArray\];\s*const rawProductData = productsArray\[0\];\s*if \(\!rawProductData \|\| Object\.keys\(rawProductData\)\.length === 0\) continue;\s*try \{/g;

const replacement = `let successfulScans = 0;
      
      const filePathsArray = Array.isArray(imagePath) ? imagePath : [imagePath];
      const ocrResult = await runOcrPipeline(filePathsArray, metadata.forceEngine);
      if (!ocrResult) {
        await batch.update({ status: 'failed', errorMessage: 'Could not extract text.' });
        return;
      }
      
      let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;
      if (!Array.isArray(productsArray)) productsArray = [productsArray];
      if (productsArray.length > 1) {
        await batch.update({ status: 'failed', errorMessage: 'Multiple products detected.' });
        return;
      }
      
      const rawProductData = productsArray[0];
      if (!rawProductData || Object.keys(rawProductData).length === 0) {
        await batch.update({ status: 'failed', errorMessage: 'No consumer packaging found.' });
        return;
      }
      
      try {`;

if (regex.test(js)) {
  js = js.replace(regex, replacement);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Replaced bad block!");
} else {
  console.log("Could not find bad block via regex.");
}
