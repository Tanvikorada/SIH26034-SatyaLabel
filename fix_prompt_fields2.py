import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

old_json = r'\{\s*"manufacturer_name": string or null,[\s\S]*?"consumer_care_details": string or null\s*\}'

new_json = """{
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
  }"""

ocr = re.sub(old_json, new_json, ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Updated Groq prompt")
