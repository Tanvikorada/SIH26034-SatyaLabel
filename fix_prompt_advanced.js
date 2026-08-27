const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const oldPrompt = `const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",
  "meta_obstruction": "none" | "thumb_covering_text" | "partially_cut_off",
  "meta_quality_reason": "Explain if it is blurry or obstructed. If good, put null",
  "manufacturer_name": "string or null",`;

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
  "manufacturer_name": "string or null",`;

js = js.replace(oldPrompt, newPrompt);

const oldPromptEnd = `CRITICAL RULES FOR HALLUCINATION PREVENTION:
- If a value (like MRP) is blurry, obstructed by a thumb, or cut off, DO NOT GUESS IT. Set it to null.
- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.\` + \n  (tesseractText ?`;

const newPromptEnd = `CRITICAL RULES FOR HALLUCINATION PREVENTION:
- STICKER OVERRIDE: If you see a secondary paper sticker placed over the original packaging (commonly done by importers to add Indian MRP/FSSAI details), you MUST prioritize the data printed on the sticker over the underlying packaging.
- WHOLESALE DETECTION: Set is_wholesale_or_multipiece_package to true ONLY if the product is a large wholesale carton, bulk box, or shrink-wrapped bundle of multiple retail items.
- If a value (like MRP) is blurry, obstructed by a thumb, or cut off by glare, DO NOT GUESS IT. Set it to null.
- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.\` + \n  (tesseractText ?`;

js = js.replace(oldPromptEnd, newPromptEnd);
js = js.replace(oldPromptEnd, newPromptEnd); // because there are two instances (one for gemini, one for groq)

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Advanced prompt injected");
