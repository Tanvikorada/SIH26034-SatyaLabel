const { extractFields } = require('./backend/services/extraction_service');
const { validateCompliance } = require('./backend/services/rules_engine');

async function test() {
  const rawProductData = {
    meta_image_quality: 'good',
    meta_obstruction: 'none',
    product_name: 'Test',
    brand_name: 'TestBrand'
  };

  const ocrResult = { text: 'Some raw text', _fontMetrics: null };

  const fieldsMap = extractFields(
    ocrResult.text,
    rawProductData,
    ocrResult._fontMetrics || null
  );

  console.log("Fields:", fieldsMap);

  const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, {});
  console.log("Violations:", violations.length);
}
test().catch(console.error);
