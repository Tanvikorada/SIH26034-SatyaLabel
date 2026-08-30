const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

js = js.replace(/async function validateResolution\(imagePath\) \{/g, `async function validateResolution(imagePath) {
  console.log("validateResolution CALLED WITH:", imagePath, typeof imagePath, Array.isArray(imagePath));
`);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Added log");
