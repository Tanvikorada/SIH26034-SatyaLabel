const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace(
  "if (!ocrResult.success) {",
  "if (!ocrResult) {"
);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Success check fixed");
