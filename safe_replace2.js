const fs = require('fs');
let js = fs.readFileSync('temp_rules.js', 'utf8');

const startIndex = js.indexOf('function checkMRP(fields) {');
const nextFunctionIndex = js.indexOf('function checkConsumerCare(fields) {');

if (startIndex !== -1 && nextFunctionIndex !== -1) {
  const newRule = `function checkMRP(fields) {
  const R = 'Rule 6 / Rule 2';
  const T = 'Maximum Retail Price (MRP) - Inclusive of All Taxes';
  const f = 'mrp';

  const hasTaxStr = fields.mrp_includes_tax_statement && (typeof fields.mrp_includes_tax_statement === 'boolean' ? fields.mrp_includes_tax_statement : String(fields.mrp_includes_tax_statement).toLowerCase().includes('incl'));

  if (!fields.mrp) {
    if (hasTaxStr) return { rule_id: R, rule_title: T, field: f, status: 'MANUAL REVIEW', severity: 'medium', confidence: 'high', detail: 'Tax statement ("INCL. OF ALL TAXES") was found on the packaging, but the numerical MRP price is missing from the extraction. Manual review required to locate the price (e.g., printed on neck or lid).' };
    return { rule_id: R, rule_title: T, field: f, status: 'POTENTIAL NON-COMPLIANCE', severity: 'high', confidence: 'high', detail: 'MRP (Maximum Retail Price inclusive of all taxes) is not declared on the label. This is mandatory under Rule 6 read with Rule 2.' };
  }

  const mrpStr = String(fields.mrp);

  if (!hasTaxStr) {
    return { rule_id: R, rule_title: T, field: f, status: 'POTENTIAL NON-COMPLIANCE', severity: 'high', confidence: 'high', detail: 'MRP value "' + mrpStr + '" is declared, but lacks the mandatory declaration "Inclusive of all taxes" (or similar wording).' };
  }

  return { rule_id: R, rule_title: T, field: f, status: 'PASS', detail: 'Valid MRP with tax statement found.' };
}

  // C08 - Consumer Care Contact Details (Rule 6)
  `;
  js = js.substring(0, startIndex) + newRule + js.substring(nextFunctionIndex);
  fs.writeFileSync('backend/services/rules_engine.js', js);
  console.log("Safely replaced checkMRP!");
} else {
  console.log("Indexes not found!");
}
