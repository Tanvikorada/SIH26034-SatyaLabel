import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

find_prompt = '''If a field is not visible or not present on the label, return null for it.
Do not guess or hallucinate values - only extract what is actually visible in the image.'''

replace_prompt = '''If a field is not visible or not present on the label, return null for it.
Do not guess or hallucinate values - only extract what is actually visible in the image.

EXAMPLE INPUT LABEL TEXT: "LAYS MAGIC MASALA. MRP Rs 50 (incl. of all taxes). Net Wt 50g. Mfd: 01/2026. Mfd by: Pepsico India Holdings, DLF Tower, Gurugram. Call 1800-22-4020."
EXAMPLE OUTPUT JSON:
{
  "manufacturer_name": "Pepsico India Holdings",
  "manufacturer_address": "DLF Tower, Gurugram",
  "common_name": "MAGIC MASALA",
  "net_quantity": "50",
  "net_quantity_unit": "g",
  "mrp": "Rs 50",
  "mrp_includes_tax_statement": true,
  "mfg_date": "01/2026",
  "consumer_care_details": "1800-22-4020"
}'''

ocr = ocr.replace(find_prompt, replace_prompt)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
