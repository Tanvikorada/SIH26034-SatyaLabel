with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

ocr = ocr.replace('temperature: 0.1,', 'temperature: 0.0,')

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Temperature set to 0.0")
