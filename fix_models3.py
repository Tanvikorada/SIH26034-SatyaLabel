with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()
ocr = ocr.replace("'gemini-1.5-flash'", "'gemini-pro-vision'")

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    rules = f.read()
rules = rules.replace("'gemini-1.5-flash'", "'gemini-pro'")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(rules)
print("Done")
