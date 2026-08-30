import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    js = f.read()

prompt_old_start = "const STRUCTURED_PROMPT = `You are extracting mandatory declarations"
# We need to replace the entire STRUCTURED_PROMPT variable definition.
# Find where it ends
# It ends around `(tesseractText ? `\n\nHere is some raw...`

# We will just replace it by matching the whole block using regex
import re

new_prompt = """const STRUCTURED_PROMPT = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",
  "meta_obstruction": "none" | "thumb_covering_text" | "partially_cut_off",
  "meta_quality_reason": "Explain if it is blurry or obstructed. If good, put null",
  "manufacturer_name": string or null,
  "manufacturer_address": string or null,
  "common_name": string or null,
  "net_quantity": string or null,
  "net_quantity_unit": string or null,
  "mrp": string or null,
  "mrp_includes_tax_statement": boolean,
  "mfg_date": string or null,
  "consumer_care_details": string or null,
  "brand_name": string or null,
  "best_before": string or null,
  "batch_lot_number": string or null,
  "fssai_license": string or null,
  "country_of_origin": string or null,
  "ingredients": string or null,
  "nutrition": string or null,
  "veg_nonveg": string or null,
  "allergens_or_warnings": string or null
}

CRITICAL RULES FOR HALLUCINATION PREVENTION:
- If a value (like MRP) is blurry, obstructed by a thumb, or cut off, DO NOT GUESS IT. Set it to null.
- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.` + 
(tesseractText ? `\\n\\nHere is some raw, noisy OCR text. Use it ONLY as a hint, do not blindly trust it if it conflicts with what you see:\\n${tesseractText}` : '');"""

js = re.sub(r'const STRUCTURED_PROMPT = `You are extracting mandatory declarations.*?:\'\'\);', new_prompt, js, flags=re.DOTALL)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Vision prompt updated for true AI brain capabilities")
