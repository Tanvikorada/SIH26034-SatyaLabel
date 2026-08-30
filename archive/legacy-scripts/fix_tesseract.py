with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

ocr = ocr.replace("const result = await Tesseract.recognize(imagePath, 'eng+hin', {", "const result = await Tesseract.recognize(imagePath, 'eng', {")
ocr = ocr.replace("console.log('[OCR] Running Tesseract (eng+hin).');", "console.log('[OCR] Running Tesseract (eng).');")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Removed Hindi from Tesseract")
