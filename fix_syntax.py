with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    ocr = f.read()

bad_str = "console.warn([OCR] Gemini failed with  () - retrying with ...);"
good_str = "console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);"

ocr = ocr.replace(bad_str, good_str)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(ocr)
