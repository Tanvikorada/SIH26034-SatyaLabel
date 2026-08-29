const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

// Fix checkUnitConvention
const unitStart = js.indexOf('function checkUnitConvention(fields) {');
const unitEnd = js.indexOf('function checkMfgDate(fields) {');

if (unitStart !== -1 && unitEnd !== -1) {
  const newUnitRule = `function checkUnitConvention(fields) {
  const R = 'Rule 13';
  const T = 'Statement of Units - Standard SI Units Required';
  const f = 'net_quantity';

  if (!isPresent(fields.net_quantity)) return pass(R, T, f); // Caught by presence check

  const qty = String(fields.net_quantity);
  const unit = String(fields.net_quantity_unit || '').toLowerCase().trim();

  // No numeric value
  if (!/\\d/.test(qty)) {
    return pnoc(R, T, f, 'high',
      \`Net quantity "\${qty}" does not contain a numeric value. A quantity like "500g" or "1 kg" is required under Rule 11.\`);
  }

  // No recognized unit
  if (!unit || !/^(g|kg|ml|l|cm|m|nos|pieces|n|u)$/i.test(unit)) {
    return pnoc(R, T, f, 'medium',
      \`Net quantity "\${qty} \${unit}" does not contain a recognized standard unit. \` +
      'Valid units include: g, kg, ml, L, cm, m, nos., pieces. ' +
      'Check the Fourth Schedule for commodity-specific exceptions before citing a violation.');
  }

  return pass(R, T, f);
}

// C06 - Month and Year of Manufacture / Pre-packing / Import (Rule 6)
`;
  js = js.substring(0, unitStart) + newUnitRule + js.substring(unitEnd);
}

// Fix checkMfgDate
const dateStart = js.indexOf('function checkMfgDate(fields) {');
const dateEnd = js.indexOf('function checkBestBefore(fields, options = {}) {');

if (dateStart !== -1 && dateEnd !== -1) {
  const newDateRule = `function checkMfgDate(fields) {
  const R = 'Rule 6';
  const T = 'Month and Year of Manufacture / Pre-packing / Import';
  const f = 'mfg_date';

  if (!isPresent(fields.mfg_date)) {
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f, 'Month/year of manufacture was not detected, but OCR confidence is low. Cannot confirm absence of this declaration from a low-quality image - physical inspection required.');
    }
    return pnoc(R, T, f, 'high', 'Month and year of manufacture/packing/import is not declared. This is mandatory under Rule 6. Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025).');
  }

  const str = String(fields.mfg_date).trim();
  
  // As long as it has digits, we'll give it a pass since DD/MM/YY or DD/MM/YYYY is technically compliant
  if (!/\\d/.test(str)) {
    return pnoc(R, T, f, 'medium', \`Manufacturing date "\${str}" does not match a valid format. Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025) per Rule 6.\`);
  }

  return pass(R, T, f);
}

// C07 - Best Before / Use By Date (Rule 6 / Rule 2)
`;
  js = js.substring(0, dateStart) + newDateRule + js.substring(dateEnd);
}

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Replaced using substring!");
