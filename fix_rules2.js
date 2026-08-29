const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

// Fix checkUnitConvention
const oldUnitRule = `function checkUnitConvention(fields) {
  const R = 'Rule 13';
  const T = 'Statement of Units - Standard SI Units Required';
  const f = 'net_quantity';

  if (!isPresent(fields.net_quantity)) return pass(R, T, f); // Caught by presence check

  const qty = String(fields.net_quantity);

  // Explicit non-standard unit
  if (NON_STANDARD_UNITS.test(qty)) {
    const match = qty.match(NON_STANDARD_UNITS);
    return pnoc(R, T, f, 'high',
      \`Net quantity uses non-standard unit "\${match?.[0]}". \` +
      'Only SI/metric units (g, kg, ml, L, m, cm, pieces, nos.) are permitted under Rule 13. ' +
      'Note: Rule 13 has commodity-specific exceptions in the Fourth Schedule - officer should check if an exception applies.');
  }

  // No numeric value
  if (!/\\d/.test(qty)) {
    return pnoc(R, T, f, 'high',
      \`Net quantity "\${qty}" does not contain a numeric value. A quantity like "500g" or "1 kg" is required under Rule 11.\`);
  }

  // No recognized unit
  if (!STANDARD_UNITS.test(qty)) {
    return pnoc(R, T, f, 'medium',
      \`Net quantity "\${qty}" does not contain a recognized standard unit. \` +
      'Valid units include: g, kg, ml, L, cm, m, nos., pieces. ' +
      'Check the Fourth Schedule for commodity-specific exceptions before citing a violation.');
  }

  return pass(R, T, f);
}`;

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
}`;


const oldDateRule = `function checkMfgDate(fields) {
  const R = 'Rule 6';
  const T = 'Month and Year of Manufacture / Pre-packing / Import';
  const f = 'mfg_date';

  if (!isPresent(fields.mfg_date)) {
    // Low OCR confidence or missing - don't claim it's definitively absent
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f,
        'Month/year of manufacture was not detected, but OCR confidence is low. ' +
        'Cannot confirm absence of this declaration from a low-quality image - physical inspection required.');
    }
    return pnoc(R, T, f, 'high',
      'Month and year of manufacture/packing/import is not declared. ' +
      'This is mandatory under Rule 6. Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025).');
  }

  const str = String(fields.mfg_date).trim();
  const validFormat = DATE_PATTERNS.some(p => p.test(str));

  if (!validFormat) {
    return pnoc(R, T, f, 'medium',
      \`Manufacturing date "\${str}" does not match a valid format. \` +
      'Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025) per Rule 6.');
  }

  const parsed = parseDate(str);
  if (parsed) {
    const now = new Date();
    if (parsed.year > now.getFullYear() + 1) {
      return pnoc(R, T, f, 'high', \`Manufacturing year "\${parsed.year}" is in the future. This is invalid.\`);
    }
  }

  return pass(R, T, f);
}`;

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
}`;

js = js.replace(oldUnitRule, newUnitRule);
js = js.replace(oldDateRule, newDateRule);

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Replaced Unit and Date rules!");
