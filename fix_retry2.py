with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

start_str = '} catch (err) {'
end_str = 'throw err;\n    }'

start_idx = ocr.find(start_str)
end_idx = ocr.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_fallback = """} catch (err) {
      if (attempt < 2) {
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying once...`);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, modelName);
      }
      throw err;
    }"""
    ocr = ocr[:start_idx] + new_fallback + ocr[end_idx + len(end_str):]
    
    with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
        f.write(ocr)
    print("Replaced!")
else:
    print("Not found")
