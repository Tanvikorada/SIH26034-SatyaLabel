with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Fix default param
ocr = ocr.replace("modelName = 'gemini-1.5-flash-latest'", "modelName = 'gemini-3.7-flash'")
# Fix fallback chain in ocr_service
ocr = ocr.replace("const nextModel = modelName === 'gemini-1.5-flash-latest' \n          ? 'gemini-1.5-pro-latest' \n          : (modelName === 'gemini-1.5-pro-latest' ? 'gemini-pro-vision' : 'gemini-1.0-pro-vision-latest');", "const nextModel = modelName === 'gemini-3.7-flash' \n          ? 'gemini-3.6-flash' \n          : (modelName === 'gemini-3.6-flash' ? 'gemini-2.5-flash' : 'gemini-flash-latest');")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)


with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    rules = f.read()

rules = rules.replace("['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro']", "['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest']")

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(rules)
