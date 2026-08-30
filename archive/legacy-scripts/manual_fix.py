with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

start = ocr.find('  } catch (err) {')
end = ocr.find('throw err;\n  }', start) + len('throw err;\n  }')

if start != -1 and end != -1:
    new_catch = '''  } catch (err) {
    if (attempt < 3) {
      // Fallback chain: 1.5-flash -> 1.5-pro -> 1.0-pro-vision
      const nextModel = modelName === 'gemini-1.5-flash-latest' 
          ? 'gemini-1.5-pro-latest' 
          : (modelName === 'gemini-1.5-pro-latest' ? 'gemini-pro-vision' : 'gemini-1.0-pro-vision-latest');
      
      console.warn([OCR] Gemini failed with  () - retrying with ...);
      await new Promise(r => setTimeout(r, 1000));
      return runGeminiVision(imagePath, attempt + 1, nextModel);
    }
    throw err;
  }'''
    ocr = ocr[:start] + new_catch + ocr[end:]
    
    with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
        f.write(ocr)
    print("Fixed ocr_service.js")
else:
    print("Could not find catch block in ocr_service.js")
