const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const regex = /const imagePaths = await detectAndCropProducts\(imagePath\);\s*let successfulScans = 0;\s*for \(const cropPath of imagePaths\) \{/g;

const replacement = `let successfulScans = 0;
      const ocrResult = await runOcrPipeline(imagePath, metadata.forceEngine);
      if (ocrResult) {
        const cropPath = imagePath[0] || imagePath; // just for the thumbnail`;

if (regex.test(js)) {
  js = js.replace(regex, replacement);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed runBatchPipeline!");
} else {
  console.log("Could not find detectAndCropProducts block.");
}
