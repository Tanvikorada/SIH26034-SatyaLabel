const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

code = code.replace(
  'products: [{',
  'products: [{\n    ai_summary: "string (A 3-4 sentence detailed executive summary of the product\'s compliance state and overall health profile)",'
);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA SUMMARY FIXED 3");
