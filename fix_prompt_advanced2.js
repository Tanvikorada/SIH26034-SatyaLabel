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
  "is_wholesale_or_multipiece_package": true | false,
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
}

CRITICAL RULES FOR HALLUCINATION PREVENTION:
- STICKER OVERRIDE: If you see a secondary paper sticker placed over the original packaging (commonly done by importers to add Indian MRP/FSSAI details), you MUST prioritize the data printed on the sticker over the underlying packaging.
- WHOLESALE DETECTION: Set is_wholesale_or_multipiece_package to true ONLY if the product is a large wholesale carton, bulk box, or shrink-wrapped bundle of multiple retail items.
- If a value (like MRP) is blurry, obstructed by a thumb, or cut off by glare, DO NOT GUESS IT. Set it to null.
- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.\` + `;

const parts = js.split('const STRUCTURED_PROMPT = `You are the core "AI Brain"');
if (parts.length === 3) {
  const endMarker = 'Return ONLY the JSON array.` + ';
  
  const end1 = parts[1].indexOf(endMarker);
  const end2 = parts[2].indexOf(endMarker);

  if (end1 !== -1 && end2 !== -1) {
    js = parts[0] + newPrompt + parts[1].substring(end1 + endMarker.length) + newPrompt + parts[2].substring(end2 + endMarker.length);
    fs.writeFileSync('backend/services/ocr_service.js', js);
    console.log("Replaced perfectly.");
  } else {
    console.log("End marker not found", end1, end2);
  }
} else {
  console.log("Split failed", parts.length);
}
