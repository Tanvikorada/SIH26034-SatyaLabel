with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

old_block = """    } catch (err) {
      if (attempt < 3) {
        const nextModel = modelName === 'gemini-1.5-flash' 
              ? 'gemini-1.5-pro' 
              : (modelName === 'gemini-1.5-pro' ? 'gemini-1.0-pro-vision-latest' : 'gemini-pro-vision');
        
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
        await new Promise(r => setTimeout(r, 1000));
        return runGeminiVision(imagePath, attempt + 1, nextModel);
      }
      throw err;
    }"""

new_block = """    } catch (err) {
      if (attempt < 2) {
        console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying once...`);
        await new Promise(r => setTimeout(r, 2000));
        return runGeminiVision(imagePath, attempt + 1, modelName);
      }
      throw err;
    }"""

if old_block in ocr:
    ocr = ocr.replace(old_block, new_block)
    with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
        f.write(ocr)
    print("Replaced!")
else:
    print("Block not found!")
