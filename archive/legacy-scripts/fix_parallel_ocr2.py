import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

pattern = r'try \{\s*await validateResolution\(imagePath\);\s*processedPath = await preprocessImage\(imagePath\);\s*console\.log\("\[OCR\] Running primary Tesseract extraction\.\.\."\);\s*let ocrResult = await runTesseract\(processedPath\);\s*// Fallback to Gemini if Tesseract output is too poor\s*if \(true\) \{ // ALWAYS run Groq Vision for highly accurate structured data extraction\s*console\.log\("\[OCR\] Tesseract confidence low \(" \+ ocrResult\.confidence\.toFixed\(1\) \+ "%\)\. Attempting Groq Vision fallback\.\.\."\);\s*try \{\s*const groqResult = await runGroqVision\(processedPath, 1, \'qwen/qwen3\.8-27b\', ocrResult\.text\);\s*return \{\s*text: groqResult\.text,\s*engine: "groq",\s*confidenceAvg: groqResult\.confidence,\s*geminiStructuredData: groqResult\.structuredData, \s*_fontMetrics: ocrResult\._fontMetrics,\s*\};\s*\} catch \(groqErr\) \{\s*console\.warn\("\[OCR\] Groq fallback failed: " \+ groqErr\.message \+ "\. Proceeding safely with Tesseract result\."\);\s*\}\s*\}\s*return ocrResult;'

new_pipeline = """try {
      await validateResolution(imagePath);
      processedPath = await preprocessImage(imagePath);
      
      console.log("[OCR] Running Tesseract and Groq Vision in PARALLEL for maximum speed...");
      
      // We run them simultaneously. Tesseract is kept strictly for font-metrics bounding boxes.
      // Groq does the heavy lifting of structured data extraction.
      const [ocrResult, groqResult] = await Promise.all([
        runTesseract(processedPath).catch(err => {
          console.warn("[OCR] Tesseract failed, skipping metrics: " + err.message);
          return { text: '', confidence: 0, engine: 'tesseract', _fontMetrics: [] };
        }),
        runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', '').catch(err => {
          console.warn("[OCR] Groq API failed: " + err.message);
          return null;
        })
      ]);

      if (groqResult) {
          return {
            text: groqResult.text,
            engine: "groq",
            confidenceAvg: groqResult.confidence,
            geminiStructuredData: groqResult.structuredData, 
            _fontMetrics: ocrResult._fontMetrics || [],
          };
      }
      
      return ocrResult;"""

ocr = re.sub(pattern, new_pipeline, ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Updated OCR pipeline to run in parallel")
