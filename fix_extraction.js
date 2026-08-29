const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

const targetStart = js.indexOf('function extractFields(rawText, geminiStructuredData = null, ocrFontMetrics = null) {');
const targetEnd = js.indexOf('function extractFieldsArray(rawText, geminiData = null) {');

const newExtractFields = `function extractFields(rawText, geminiStructuredData = null, ocrFontMetrics = null) {
  const g = geminiStructuredData || {};

  const fields = {
    product_name: g.common_name || g.product_name || null,
    brand_name: g.brand_name || null,
    net_quantity: g.net_quantity || null,
    net_quantity_unit: g.net_quantity_unit || null,
    mrp: g.mrp || null,
    mrp_includes_tax_statement: g.mrp_includes_tax_statement || null,
    mfg_date: g.mfg_date || null,
    best_before: g.best_before || null,
    manufacturer_name: g.manufacturer_name || null,
    manufacturer_address: g.manufacturer_address || null,
    customer_care: g.consumer_care_details || null,
    batch_lot_number: g.batch_lot_number || null,
    fssai_license: g.fssai_license || null,
    country_of_origin: g.country_of_origin || null,
    ingredients: g.ingredients || null,
    veg_nonveg: g.veg_nonveg || null,
    
    _netQtyNormalized: g.net_quantity ? parseFloat(String(g.net_quantity).replace(/[^0-9.]/g, '')) : null,
    _confidence: {
      product_name: g.product_name ? 'high' : null,
      mrp: g.mrp ? 'high' : null,
      net_quantity: g.net_quantity ? 'high' : null,
      manufacturer_address: g.manufacturer_address ? 'high' : null,
    },
    _mrpValues: g.mrp ? [g.mrp] : [],
    _rawText: rawText || ''
  };

  return fields;
}

/**
 * @deprecated
`;

js = js.substring(0, targetStart) + newExtractFields + js.substring(targetEnd + '/**\n * @deprecated\n'.length - 1);
fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Fixed extraction!");
