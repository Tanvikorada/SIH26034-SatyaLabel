import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Remove the confidence condition
old_condition = "if (ocrResult.confidence < OCR_CONFIDENCE_THRESHOLD || ocrResult.text.trim().length < MIN_OCR_TEXT_LENGTH) {"
new_condition = "if (true) { // ALWAYS run Groq Vision for highly accurate structured data extraction"

ocr = ocr.replace(old_condition, new_condition)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)

print("Updated pipeline to always run Groq")
