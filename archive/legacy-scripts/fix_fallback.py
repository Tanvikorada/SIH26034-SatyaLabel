import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

ocr = re.sub(
    r"const nextModel = modelName === 'gemini-3\.7-flash'[\s\S]*?\: 'gemini-flash-latest'\);",
    "const nextModel = modelName === 'gemini-flash-latest' \\n            ? 'gemini-3.7-flash' \\n            : (modelName === 'gemini-3.7-flash' ? 'gemini-3.6-flash' : 'gemini-2.5-flash');",
    ocr
)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
