with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Replace timeout
ocr = ocr.replace("setTimeout(() => controller.abort(), 120000)", "setTimeout(() => controller.abort(), 180000)")

# Replace models
ocr = ocr.replace("modelName = 'gemini-2.5-flash'", "modelName = 'gemini-3.7-flash'")

fallback = """catch (err) {
      if (attempt < 3) {
        const nextModel = modelName === 'gemini-3.7-flash' ? 'gemini-flash-latest' : 'gemini-2.5-flash';
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, nextModel);
      }
      throw err;
    }"""

import re
ocr = re.sub(r'catch \(err\) \{[\s\S]*?throw err;\s*\}', fallback, ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Updated models and timeout")
