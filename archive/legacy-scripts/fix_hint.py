with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

bad_call = "const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', ocrResult.text);"
good_call = """
          // If Tesseract confidence is extremely low (< 50), it means the text is likely heavily distorted by glare.
          // Passing a pure garbage string as a hint causes Groq to hallucinate (e.g. guessing American Coke data).
          // So we only pass the hint if Tesseract was somewhat confident.
          const isGarbage = ocrResult.confidence < 50;
          const safeHint = isGarbage ? '' : ocrResult.text;
          if (isGarbage) console.log("[OCR] Tesseract confidence too low (" + ocrResult.confidence + "%). Hiding hint from Groq to prevent hallucinations.");
          const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', safeHint);
"""

ocr = ocr.replace(bad_call, good_call)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Hint filter applied")
