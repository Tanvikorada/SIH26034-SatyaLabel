const fs = require("fs");
let text = fs.readFileSync("backend/services/ocr_service.js", "utf8");
const replaceText = `async function runOcrPipeline(imagePath, metadata = {}) {
  let processedPath = null;
  try {
    await validateResolution(imagePath);
    processedPath = await preprocessImage(imagePath);
    console.log("[OCR] Using Gemini Vision for highly accurate extraction.");
    try {
      const geminiResult = await runGeminiVision(processedPath);
      return {
        text: geminiResult.text,
        engine: "gemini",
        confidenceAvg: geminiResult.confidence,
        geminiStructuredData: geminiResult.structuredData,
        _fontMetrics: null,
      };
    } catch (geminiErr) {
      console.warn("Gemini execution failed (" + geminiErr.message + ")");
      throw Object.assign(
        new Error("Gemini Vision Extraction Failed: " + geminiErr.message),
        { code: "GEMINI_EXTRACTION_FAILED" }
      );
    }
  } finally {
    if (processedPath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch (_) {}
    }
  }
}
module.exports = { runOcrPipeline };`;
text = text.replace(/async function runOcrPipeline[\s\S]*/, replaceText);
fs.writeFileSync("backend/services/ocr_service.js", text);
