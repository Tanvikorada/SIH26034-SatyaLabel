const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

// Remove the injected header duplicate at the top
const headerIndex = js.indexOf('// backend/services/rules_engine.js');
if (headerIndex > 0) {
  js = js.substring(headerIndex);
}

// Now replace the REAL checkMRP inside the file
const startToken = '// C07 - MRP / Retail Sale Price inclusive of all taxes (Rule 6 / Rule 2)';
const endToken = '// C08 - Consumer Care Details (Rule 6)';
const startIndex = js.indexOf(startToken);
const endIndex = js.indexOf(endToken);

const newMRP = `// C07 - MRP / Retail Sale Price inclusive of all taxes (Rule 6 / Rule 2)
function checkMRP(fields) {
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
}

`;

if (startIndex !== -1 && endIndex !== -1) {
  js = js.substring(0, startIndex) + newMRP + js.substring(endIndex);
  fs.writeFileSync('backend/services/rules_engine.js', js);
  console.log("Fixed rules clean!");
} else {
  console.log("Could not find tokens!");
}
