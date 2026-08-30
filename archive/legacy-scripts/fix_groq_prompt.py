import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Update signature
ocr = ocr.replace("async function runGroqVision(imagePath, attempt = 1, modelName = 'qwen/qwen3.8-27b') {", "async function runGroqVision(imagePath, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {")

# Update prompt
old_prompt = "Do not guess or hallucinate values - only extract what is actually visible in the image. Return ONLY valid JSON.`;"
new_prompt = "Do not guess or hallucinate values - only extract what is actually visible in the image. Return ONLY valid JSON.` + (tesseractText ? `\\n\\nHere is some raw, noisy text extracted from the image by a secondary OCR engine. Use it as a hint to locate fields:\\n${tesseractText}` : '');"
ocr = ocr.replace(old_prompt, new_prompt)

# Update recursive call
ocr = ocr.replace("return runGroqVision(imagePath, attempt + 1, nextModel);", "return runGroqVision(imagePath, attempt + 1, nextModel, tesseractText);")

# Update caller
ocr = ocr.replace("const groqResult = await runGroqVision(processedPath);", "const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', ocrResult.text);")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)

print("Injected Tesseract text into Groq prompt")
