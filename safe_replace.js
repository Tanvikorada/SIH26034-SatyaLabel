const fs = require('fs');
let js = fs.readFileSync('temp_rules.js', 'utf8');

const target = `function checkMRP(fields) {
  const R = 'Rule 6 / Rule 2';
  const T = 'Maximum Retail Price (MRP) - Inclusive of All Taxes';
  const f = 'mrp';

  const rawText = String(fields._rawText || '');

  if (!isPresent(fields.mrp)) {
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f,
        'MRP was not detected, but OCR confidence is low. ' +
        'Cannot confirm absence from a low-quality image - physical inspection required.');
    }
    return pnoc(R, T, f, 'high',
      'MRP (Maximum Retail Price inclusive of all taxes) is not declared on the label. ' +
      'This is mandatory under Rule 6 read with Rule 2.');
  }

  const mrpStr = String(fields.mrp);

  // Check ? / Rs. symbol
  if (!MRP_SYMBOL.test(mrpStr) && !MRP_SYMBOL.test(rawText.slice(0, 500))) {
    return pnoc(R, T, f, 'medium',
      \`MRP value "\${mrpStr}" does not include the required "?" or "Rs." currency symbol.\`);
  }

  // Check "inclusive of all taxes"
  if (!INCL_TAX.test(mrpStr) && !INCL_TAX.test(rawText.slice(0, 1000))) {
    return pnoc(R, T, f, 'high',
      \`MRP value "\${mrpStr}" is declared, but lacks the mandatory declaration "Inclusive of all taxes" (or similar wording).\`);
  }

  return makeResult(R, T, f, S.PASS, null, 'Valid MRP with tax statement found.');
}`;

const replace = `function checkMRP(fields) {
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
}`;

const originalCount = js.length;
js = js.replace(target, replace);
if (js.length === originalCount) {
  console.log("Failed to replace! String mismatch.");
} else {
  fs.writeFileSync('backend/services/rules_engine.js', js);
  console.log("Successfully replaced checkMRP safely!");
}
