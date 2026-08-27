import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Find the block starting with "catch (err)" and ending with "throw err;\n    }"
pattern = r"catch \(err\) \{[\s\S]*?throw err;\s*\}"

new_block = """catch (err) {
      if (attempt < 2) {
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying once...`);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, modelName);
      }
      throw err;
    }"""

ocr = re.sub(pattern, new_block, ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Regex replaced!")
