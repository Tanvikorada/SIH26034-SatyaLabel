import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    js = f.read()

# Change the default model in runGroqVision and in runOcrPipeline
js = js.replace("async function runGroqVision(imagePath, attempt = 1, modelName = 'llama-3.2-90b-vision-preview', tesseractText = '')", "async function runGroqVision(imagePath, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '')")
js = js.replace("const groqResult = await runGroqVision(processedPath, 1, 'llama-3.2-90b-vision-preview', safeHint);", "const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', safeHint);")

# Change the fallback in runGroqVision ONLY
old_catch = """  } catch (err) {
    if (attempt < 3) {
      const nextModel = modelName === 'llama-3.2-90b-vision-preview' ? 'llama-3.2-11b-vision-preview' : 'llama-3.2-90b-vision-preview';
      console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePath, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }"""

new_catch = """  } catch (err) {
    if (attempt < 4) {
      const fallbackModels = ['qwen/qwen3.8-27b', 'llama-3.2-90b-vision-preview', 'llama-3.2-11b-vision-preview', 'qwen-vl-72b'];
      const nextModel = fallbackModels[attempt];
      console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePath, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }"""

js = js.replace(old_catch, new_catch)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Groq model logic updated")
