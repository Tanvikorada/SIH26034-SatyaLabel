import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    js = f.read()

prompt_old = """const STRUCTURED_PROMPT = `You are extracting mandatory declarations from a packaged commodity label image for a Legal Metrology compliance check. Return ONLY valid JSON with these keys:"""
prompt_new = """const STRUCTURED_PROMPT = `You are extracting mandatory declarations from a packaged commodity label image for a Legal Metrology compliance check. 
IMPORTANT: First, check if there are multiple DISTINCT products (e.g. 2 different chips packets, a bottle and a box, etc.) in the image. 
If there are multiple products, return exactly this JSON and nothing else:
{ "error": "MULTI_PRODUCT_DETECTED" }

Otherwise, if there is only one product, return ONLY valid JSON with these keys:"""

js = js.replace(prompt_old, prompt_new)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Prompts updated")
