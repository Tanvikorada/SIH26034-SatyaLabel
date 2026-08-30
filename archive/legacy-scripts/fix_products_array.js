const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `let productsArray = ocrResult.structuredData?.products || ocrResult.structuredData;`;
const replacement = `let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;`;

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed property name to geminiStructuredData!");
} else {
  console.log("Target not found!");
}
