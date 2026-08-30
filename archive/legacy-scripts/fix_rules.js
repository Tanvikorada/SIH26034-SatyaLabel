const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const targetMRPStart = js.indexOf('// C07 - MRP / Retail Sale Price inclusive of all taxes (Rule 6 / Rule 2)');
const targetMRPEnd = js.indexOf('// C08 - Consumer Care Details (Rule 6)');

const newMRP = `// C07 - MRP / Retail Sale Price inclusive of all taxes (Rule 6 / Rule 2)
function checkMRP(fields) {
  const R = 'Rule 6 / Rule 2';
  const T = 'Maximum Retail Price (MRP) - Inclusive of All Taxes';
  const f = 'mrp';

  if (!isPresent(fields.mrp)) {
    return pnoc(R, T, f, 'high',
      'MRP (Maximum Retail Price) is not declared on the label. This is mandatory under Rule 6 read with Rule 2.');
  }

  // Rely purely on LLM's structured flag instead of raw regex
  if (fields.mrp_includes_tax_statement !== true && String(fields.mrp_includes_tax_statement).toLowerCase() !== 'true') {
    return review(R, T, f, 'low',
      'The phrase "inclusive of all taxes" was not explicitly flagged by the Vision AI near the MRP declaration. ' +
      'Rule 6 / Rule 2 requires MRP to be stated as all-tax-inclusive. Verify manually.', 'estimated');
  }

  return pass(R, T, f);
}

`;

js = js.substring(0, targetMRPStart) + newMRP + js.substring(targetMRPEnd);
fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Fixed rules!");
