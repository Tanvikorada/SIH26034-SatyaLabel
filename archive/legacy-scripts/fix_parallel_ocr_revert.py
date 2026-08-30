import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

pattern = r'try \{\s*await validateResolution\(imagePath\);\s*processedPath = await preprocessImage\(imagePath\);\s*console\.log\("\[OCR\] Running Tesseract and Groq Vision in PARALLEL for maximum speed\.\.\."\);\s*// We run them simultaneously\. Tesseract is kept strictly for font-metrics bounding boxes\.\s*// Groq does the heavy lifting of structured data extraction\.\s*const \[ocrResult, groqResult\] = await Promise\.all\(\[\s*runTesseract\(processedPath\)\.catch\(err => \{\s*console\.warn\("\[OCR\] Tesseract failed, skipping metrics: " \+ err\.message\);\s*return \{ text: \'\', confidence: 0, engine: \'tesseract\', _fontMetrics: \[\] \};\s*\}\),\s*runGroqVision\(processedPath, 1, \'qwen/qwen3\.8-27b\', \'\'\)\.catch\(err => \{\s*console\.warn\("\[OCR\] Groq API failed: " \+ err\.message\);\s*return null;\s*\}\)\s*\]\);\s*if \(groqResult\) \{\s*return \{\s*text: groqResult\.text,\s*engine: "groq",\s*confidenceAvg: groqResult\.confidence,\s*geminiStructuredData: groqResult\.structuredData, \s*_fontMetrics: ocrResult\._fontMetrics \|\| \[\],\s*\};\s*\}\s*return ocrResult;'

reverted_pipeline = """try {
      await validateResolution(imagePath);
      processedPath = await preprocessImage(imagePath);
      
      console.log("[OCR] Running primary Tesseract extraction...");
      let ocrResult = await runTesseract(processedPath).catch(err => {
          console.warn("[OCR] Tesseract failed: " + err.message);
          return { text: '', confidence: 0, engine: 'tesseract', _fontMetrics: [] };
      });
      
      // Fallback to Gemini/Groq
      if (true) {
        console.log("[OCR] Passing Tesseract text as a hint to Groq Vision for max accuracy...");
        try {
          const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', ocrResult.text);
          return {
            text: groqResult.text,
            engine: "groq",
            confidenceAvg: groqResult.confidence,
            geminiStructuredData: groqResult.structuredData, 
            _fontMetrics: ocrResult._fontMetrics || [],
            _rawText: ocrResult.text // Pass original raw text to rules engine
          };
        } catch (groqErr) {
          console.warn("[OCR] Groq fallback failed: " + groqErr.message);
        }
      }
      
      return ocrResult;"""

ocr = re.sub(pattern, reverted_pipeline, ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Reverted parallel OCR execution")
