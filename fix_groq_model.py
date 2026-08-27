import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    js = f.read()

# Fix the fallback array of models
js = js.replace("const nextModel = modelName === 'llama-3.2-90b-vision-preview' ? 'llama-3.2-11b-vision-preview' : 'llama-3.2-90b-vision-preview';", "const nextModel = 'qwen/qwen3.8-27b';")
js = js.replace("const groqResult = await runGroqVision(processedPath, 1, 'llama-3.2-90b-vision-preview', safeHint);", "const groqResult = await runGroqVision(processedPath, 1, 'llama-3.2-90b-vision-preview', safeHint);")

def replace_groq(match):
    return """    } catch (err) {
    if (attempt < 4) {
      const fallbackModels = ['llama-3.2-90b-vision-preview', 'llama-3.2-11b-vision-preview', 'qwen/qwen3.8-27b', 'llama-3.2-90b-text-preview'];
      const nextModel = fallbackModels[attempt];
      console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePath, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }"""

js = re.sub(r'\} catch \(err\) \{.*?throw err;\n  \}', replace_groq, js, flags=re.DOTALL)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Groq model retry logic updated")
