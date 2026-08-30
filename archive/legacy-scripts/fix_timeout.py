import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

ocr = ocr.replace("modelName = 'gemini-flash-latest'", "modelName = 'gemini-1.5-flash'")
ocr = ocr.replace("modelName === 'gemini-flash-latest'", "modelName === 'gemini-1.5-flash'")
ocr = ocr.replace("'gemini-3.7-flash'", "'gemini-1.5-pro'")
ocr = ocr.replace("'gemini-3.6-flash'", "'gemini-1.0-pro-vision-latest'")
ocr = ocr.replace("'gemini-2.5-flash'", "'gemini-pro-vision'")

# Increase timeout to 120s
ocr = ocr.replace("60000", "120000")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
