const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const newPrompt = `const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",
  "meta_obstruction": "none" | "thumb_covering_text" | "partially_cut_off",
  "meta_quality_reason": "Explain if it is blurry or obstructed. If good, put null",
  "manufacturer_name": "string or null",
  "manufacturer_address": "string or null",
  "common_name": "string or null",
  "net_quantity": "string or null",
  "net_quantity_unit": "string or null",
  "mrp": "string or null",
  "mrp_includes_tax_statement": true,
  "mfg_date": "string or null",
  "consumer_care_details": "string or null",
  "brand_name": "string or null",
  "best_before": "string or null",
  "batch_lot_number": "string or null",
  "fssai_license": "string or null",
  "country_of_origin": "string or null",
  "ingredients": "string or null",
  "nutrition": "string or null",
  "veg_nonveg": "string or null",
  "allergens_or_warnings": "string or null"
}\`;
  `;

// Let's just do it simple: replace the whole string block.
// We will split on `const STRUCTURED_PROMPT = `
const parts = js.split('const STRUCTURED_PROMPT = `You are extracting mandatory declarations');
if (parts.length === 3) {
   const part1 = parts[0];
   const rest1 = parts[1].substring(parts[1].indexOf('+ \n  (tesseractText ?') !== -1 ? parts[1].indexOf('+ \n  (tesseractText ?') : parts[1].indexOf('+ \n  (tesseractText ?') === -1 ? parts[1].indexOf('+ \n') : 0);
   // wait, what does it look like? Let's print a substring!
}
