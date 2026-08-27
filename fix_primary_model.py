with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Change default model to gemini-flash-latest
ocr = ocr.replace("modelName = 'gemini-3.7-flash'", "modelName = 'gemini-flash-latest'")

# Fix fallback chain
old_fallback = "const nextModel = modelName === 'gemini-3.7-flash' \n            ? 'gemini-3.6-flash' \n            : (modelName === 'gemini-3.6-flash' ? 'gemini-2.5-flash' : 'gemini-flash-latest');"
new_fallback = "const nextModel = modelName === 'gemini-flash-latest' \n            ? 'gemini-3.7-flash' \n            : (modelName === 'gemini-3.7-flash' ? 'gemini-3.6-flash' : 'gemini-2.5-flash');"
ocr = ocr.replace(old_fallback, new_fallback)

# Reduce timeout to 15s to fail faster and retry quicker!
ocr = ocr.replace("const GEMINI_TIMEOUT_MS = 45000;", "const GEMINI_TIMEOUT_MS = 15000;")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)


with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    rules = f.read()

rules = rules.replace("['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest']", "['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-pro-latest']")

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(rules)
