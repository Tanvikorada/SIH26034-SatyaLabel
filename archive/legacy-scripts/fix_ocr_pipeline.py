import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Add Tesseract require if missing
if "require('tesseract.js')" not in ocr:
    ocr = ocr.replace("const sharp = require('sharp');", "const sharp = require('sharp');\nconst Tesseract = require('tesseract.js');")

# Replace runOcrPipeline
new_pipeline = """async function runOcrPipeline(imagePath, metadata = {}) {
  let processedPath = null;
  try {
    await validateResolution(imagePath);
    processedPath = await preprocessImage(imagePath);
    
    console.log("[OCR] Running primary Tesseract extraction...");
    let ocrResult = await runTesseract(processedPath);
    
    // Fallback to Gemini if Tesseract output is too poor
    if (ocrResult.confidence < OCR_CONFIDENCE_THRESHOLD || ocrResult.text.trim().length < MIN_OCR_TEXT_LENGTH) {
      console.log("[OCR] Tesseract confidence low (" + ocrResult.confidence.toFixed(1) + "%). Attempting Gemini fallback...");
      try {
        const geminiResult = await runGeminiVision(processedPath);
        return {
          text: geminiResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          _fontMetrics: ocrResult._fontMetrics,
        };
      } catch (geminiErr) {
        console.warn("[OCR] Gemini fallback failed (503/404): " + geminiErr.message + ". Proceeding safely with Tesseract result.");
      }
    }
    
    return ocrResult;
  } finally {
    if (processedPath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch (_) {}
    }
  }
}"""

ocr = re.sub(r'async function runOcrPipeline\(imagePath, metadata = \{\}\) \{[\s\S]*?module\.exports = \{ runOcrPipeline \};', new_pipeline + "\nmodule.exports = { runOcrPipeline };", ocr)

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Restored Tesseract pipeline")
