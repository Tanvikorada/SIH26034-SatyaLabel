import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Replace the fallback logic
new_fallback = """
    } catch (err) {
      if (attempt < 2) {
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying once...`);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, modelName);
      }
      throw err;
    }
"""

# The old fallback logic was:
old_fallback_regex = r"\} catch \(err\) \{[\s\S]*?throw err;\n    \}"

ocr = re.sub(old_fallback_regex, new_fallback.strip(), ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
