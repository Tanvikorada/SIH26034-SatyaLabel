const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetLoop = `const imagePaths = await detectAndCropProducts(imagePath);
      let successfulScans = 0;
      
      for (const cropPath of imagePaths) {
        const ocrResult = await runOcrPipeline(cropPath, metadata.forceEngine);`;

const replaceLoop = `const filePathsArray = Array.isArray(imagePath) ? imagePath : [imagePath];
      let successfulScans = 0;
      
      // Process all images at once natively via Gemini
      for (const cropPath of [filePathsArray]) {
        const ocrResult = await runOcrPipeline(cropPath, metadata.forceEngine);`;

if (js.includes(targetLoop)) {
  js = js.replace(targetLoop, replaceLoop);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed the loop cleanly!");
} else {
  console.log("Target loop not found!");
}
