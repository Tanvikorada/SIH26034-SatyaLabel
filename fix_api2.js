const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace('original_image: batch.originalImage,', 'original_image: batch.originalImage, error_message: batch.errorMessage,');

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed API output!");
