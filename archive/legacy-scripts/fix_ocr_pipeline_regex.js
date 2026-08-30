const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const regex = /async function runOcrPipeline\(imagePath, metadata = \{\}\) \{\s*let processedPath = null;\s*try \{\s*await validateResolution\(imagePath\);\s*processedPath = await preprocessImage\(imagePath\);/g;

const replacement = `async function runOcrPipeline(imagePaths, metadata = {}) {
    let processedPaths = [];
    try {
        const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
        for (const p of paths) {
          await validateResolution(p);
          processedPaths.push(await preprocessImage(p));
        }`;

if (regex.test(js)) {
  js = js.replace(regex, replacement);
  fs.writeFileSync('backend/services/ocr_service.js', js);
  console.log("Fixed runOcrPipeline loop via regex!");
} else {
  console.log("Could not match runOcrPipeline regex.");
}
