import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Replace the entire catch block using regex
ocr = re.sub(r'\} catch \(err\) \{[\s\S]*?throw err;\n    \}', '''} catch (err) {
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
    }''', ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)


with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    rules = f.read()

rules = re.sub(r'if \(!err\.message\.includes\(\'503\'\)[\s\S]*?break; // Don\'t retry if it\'s a structural error\n            \}', '// Always retry to handle 404s/403s across different models', rules)

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(rules)
