const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const pipelineStart = js.indexOf('async function runOcrPipeline(imagePaths, metadata = {}) {');
const newPipeline = `async function runOcrPipeline(imagePaths, metadata = {}) {
  let processedPaths = [];
  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    for (const p of paths) {
      await validateResolution(p);
      processedPaths.push(await preprocessImage(p));
    }
    
    let groqResult = null;
    if (config.groq?.enabled && config.groq?.apiKey) {
      console.log("[OCR] Attempting Groq Vision...");
      try {
        groqResult = await runGroqVision(processedPaths, 1, 'qwen/qwen3.8-27b');
        return {
          text: groqResult.structuredData?.products?.[0]?.raw_text_transcript || groqResult.text,
          engine: "groq",
          confidenceAvg: groqResult.confidence,
          geminiStructuredData: groqResult.structuredData, 
          _fontMetrics: [],
          _jsonText: groqResult.text
        };
      } catch (groqErr) {
        console.warn("[OCR] Groq failed: " + groqErr.message);
      }
    } 
    
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      console.log("[OCR] Attempting Gemini Vision...");
      try {
        const geminiResult = await runGeminiVision(processedPaths, 1, 'gemini-1.5-flash-latest');
        return {
          text: geminiResult.structuredData?.products?.[0]?.raw_text_transcript || geminiResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          _fontMetrics: [],
          _jsonText: geminiResult.text
        };
      } catch (geminiErr) {
        console.warn("[OCR] Gemini failed: " + geminiErr.message);
      }
    }
    
    throw new Error('All OCR engines failed or are unconfigured.');
  } finally {
    for (const p of processedPaths) {
      if (require('fs').existsSync(p)) {
        try { require('fs').unlinkSync(p); } catch (_) {}
      }
    }
  }
}

module.exports = { runOcrPipeline };
`;

js = js.substring(0, pipelineStart) + newPipeline;
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed pipeline syntax!");
