import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

old_return = """          return {
            text: groqResult.text,
            engine: "groq",
            confidenceAvg: groqResult.confidence,
            geminiStructuredData: groqResult.structuredData, 
            _fontMetrics: ocrResult._fontMetrics || [],
            _rawText: ocrResult.text // Pass original raw text to rules engine
          };"""

new_return = """          return {
            text: ocrResult.text, // Must be Tesseract raw text so regexes don't match JSON keys!
            engine: "groq",
            confidenceAvg: groqResult.confidence,
            geminiStructuredData: groqResult.structuredData, 
            _fontMetrics: ocrResult._fontMetrics || [],
            _jsonText: groqResult.text
          };"""

ocr = ocr.replace(old_return, new_return)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Fixed OCR service return to pass raw text to regexes")
