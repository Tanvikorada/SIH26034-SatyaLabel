const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const regex = /function checkMRP\(fields\) \{[\s\S]*?return pass\(R, T, f\);\s*\}/;

const newMRP = `function checkMRP(fields) {
  const R = 'Rule 6 / Rule 2';
  const T = 'Maximum Retail Price (MRP) - Inclusive of All Taxes';
  const f = 'mrp';

  if (!isPresent(fields.mrp)) {
    return pnoc(R, T, f, 'high',
      'MRP (Maximum Retail Price) is not declared on the label. This is mandatory under Rule 6 read with Rule 2.');
  }

  if (fields.mrp_includes_tax_statement !== true && String(fields.mrp_includes_tax_statement).toLowerCase() !== 'true') {
    return review(R, T, f, 'low',
      'The phrase "inclusive of all taxes" was not explicitly flagged by the Vision AI near the MRP declaration. ' +
      'Rule 6 / Rule 2 requires MRP to be stated as all-tax-inclusive. Verify manually.', 'estimated');
  }

  return pass(R, T, f);
}`;

js = js.replace(regex, newMRP);
fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Fixed rules 2!");
