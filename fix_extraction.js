const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

const sIdx = js.indexOf('function extractFields(rawText, geminiData, fontMetrics = null) {');
const eIdx = js.indexOf('  return finalFields;', sIdx);

const injection = `
  if (geminiData.is_wholesale_or_multipiece_package) {
    finalFields.is_wholesale_or_multipiece_package = geminiData.is_wholesale_or_multipiece_package;
  }
`;

js = js.substring(0, eIdx) + injection + js.substring(eIdx);
fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Extraction fixed");
