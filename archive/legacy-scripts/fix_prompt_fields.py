import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

old_json = """  {
    "manufacturer_name": string or null,
    "manufacturer_address": string or null,
    "common_name": string or null,
    "net_quantity": string or null,
    "net_quantity_unit": string or null,
    "mrp": string or null,
    "mrp_includes_tax_statement": boolean,
    "mfg_date": string or null,
    "consumer_care_details": string or null
  }"""

new_json = """  {
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
    "veg_nonveg": string or null
  }"""

ocr = ocr.replace(old_json, new_json)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Updated Groq prompt to extract maximum info")
