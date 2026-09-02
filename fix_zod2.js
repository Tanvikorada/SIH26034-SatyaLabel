const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Find the start of the object definition to inject ai_summary
const oldSchemaStart = `const ZOD_SCHEMA = JSON.stringify({`;
const newSchemaStart = `const ZOD_SCHEMA = JSON.stringify({\n  ai_summary: "string (A 3-4 sentence detailed executive summary of the product's compliance state and overall health profile)",`;

code = code.replace(oldSchemaStart, newSchemaStart);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA SUMMARY FIXED");
