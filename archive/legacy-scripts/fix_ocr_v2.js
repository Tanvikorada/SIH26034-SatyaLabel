const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. Remove require('tesseract.js')
js = js.replace(/const Tesseract = require\('tesseract\.js'\);/g, '');

// 2. Remove runTesseract function
const tesseractStart = js.indexOf('async function runTesseract(imagePath)');
if (tesseractStart !== -1) {
  let braceCount = 0;
  let started = false;
  let tesseractEnd = tesseractStart;
  for (let i = tesseractStart; i < js.length; i++) {
    if (js[i] === '{') { braceCount++; started = true; }
    else if (js[i] === '}') { braceCount--; }
    if (started && braceCount === 0) {
      tesseractEnd = i + 1;
      break;
    }
  }
  // Also remove the JSDoc above it
  const jsdocStart = js.lastIndexOf('/**', tesseractStart);
  if (jsdocStart !== -1) {
    js = js.substring(0, jsdocStart) + js.substring(tesseractEnd);
  } else {
    js = js.substring(0, tesseractStart) + js.substring(tesseractEnd);
  }
}

// 3. Update runGeminiVision and runGroqVision prompts and remove tesseractText argument
js = js.replace(/async function runGeminiVision\(imagePaths, attempt = 1, modelName = 'gemini-1\.5-flash-latest', tesseractText = ''\) \{/g, `async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-1.5-flash-latest') {`);
js = js.replace(/async function runGroqVision\(imagePaths, attempt = 1, modelName = 'qwen\/qwen3\.8-27b', tesseractText = ''\) \{/g, `async function runGroqVision(imagePaths, attempt = 1, modelName = 'qwen/qwen3.8-27b') {`);

const oldPrompt = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You will receive a JSON structure. You must extract the exact data from the packaging.
- If a value is missing, use null.

Here is some raw, noisy text extracted from the image by a secondary OCR engine. Use it as a hint to locate fields:
\${tesseractText}`;

const newPrompt = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You will receive a JSON structure. You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the \`raw_text_transcript\` field.`;

js = js.split(oldPrompt).join(newPrompt);
// Also fallback if old prompt was slightly different:
js = js.replace(/Here is some raw, noisy text extracted from the image by a secondary OCR engine\. Use it as a hint to locate fields:\r?\n\$\{tesseractText\}/g, '- Provide a literal transcription of all readable text on the package in the `raw_text_transcript` field.');

// Update ProductSchema to include raw_text_transcript
js = js.replace(/const ProductSchema = z\.object\(\{/g, `const ProductSchema = z.object({\n  raw_text_transcript: z.string().nullable().optional(),`);

// Update runOcrPipeline
const pipelineStart = js.indexOf('async function runOcrPipeline(imagePaths, metadata = {}) {');
if (pipelineStart !== -1) {
  let braceCount = 0;
  let started = false;
  let pipelineEnd = pipelineStart;
  for (let i = pipelineStart; i < js.length; i++) {
    if (js[i] === '{') { braceCount++; started = true; }
    else if (js[i] === '}') { braceCount--; }
    if (started && braceCount === 0) {
      pipelineEnd = i + 1;
      break;
    }
  }
  
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
}`;
  js = js.substring(0, pipelineStart) + newPipeline + js.substring(pipelineEnd);
}

// Remove tesseractText from recursive retries
js = js.replace(/return runGeminiVision\(imagePaths, attempt \+ 1, nextModel, tesseractText\);/g, 'return runGeminiVision(imagePaths, attempt + 1, nextModel);');
js = js.replace(/return runGroqVision\(imagePaths, attempt \+ 1, nextModel, tesseractText\);/g, 'return runGroqVision(imagePaths, attempt + 1, nextModel);');

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Rewrote OCR service.");
