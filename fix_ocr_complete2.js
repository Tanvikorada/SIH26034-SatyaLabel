const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// The original functions:
const startGemini = js.indexOf('async function runGeminiVision');
const startGroq = js.indexOf('async function runGroqVision');
const startPipeline = js.indexOf('async function runOcrPipeline');
const endPipeline = js.indexOf('module.exports = { runOcrPipeline };');

if (startGemini === -1 || startGroq === -1 || startPipeline === -1) {
  console.log("Could not find functions!");
  process.exit(1);
}

// We will replace everything from startGemini to the end of the file.
// We must make sure they are in order: runGeminiVision -> runGroqVision -> runOcrPipeline
// Let's just do a big replace.
const prefix = js.substring(0, Math.min(startGemini, startGroq, startPipeline));

const newCode = `
async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

CRITICAL INSTRUCTIONS:
- You will receive a JSON structure. You must extract the exact data from the packaging.
- If a value is missing, use null.

Here is some raw, noisy text extracted from the image by a secondary OCR engine. Use it as a hint to locate fields:
\${tesseractText}\`;

  let rawText = '';
  let structuredData = {};

  try {
    const parts = [
      { text: STRUCTURED_PROMPT }
    ];
    for (const p of paths) {
      const base64Image = require('fs').readFileSync(p).toString('base64');
      parts.push({ inlineData: { mimeType, data: base64Image } });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.0 }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${modelName}:generateContent?key=\${config.gemini.apiKey}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(\`Gemini API returned \${response.status}: \${errText}\`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const cleaned = responseText.replace(/\`\`\`(?:json)?\\s*/g, '').replace(/\`\`\`\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Gemini API extraction complete');

  } catch (err) {
    if (attempt < 2) {
      const nextModel = modelName === 'gemini-1.5-flash-latest' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';
      console.warn(\`[OCR] Gemini failed with \${modelName} (\${err.message}) - retrying with \${nextModel}...\`);
      await new Promise(r => setTimeout(r, 2000));
      return runGeminiVision(imagePaths, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }

  return {
    text: rawText,
    structuredData,
    confidence: 85,
    words: [],
    engine: 'gemini',
    _fontMetrics: null,
  };
}

async function runGroqVision(imagePaths, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

Here is some raw, noisy text extracted from the image by a secondary OCR engine. Use it as a hint to locate fields:
\${tesseractText}\`;

  let rawText = '';
  let structuredData = {};

  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const content = [
      { type: "text", text: STRUCTURED_PROMPT }
    ];
    for (const p of paths) {
      const base64Image = require('fs').readFileSync(p).toString('base64');
      content.push({ type: "image_url", image_url: { url: \`data:\${mimeType};base64,\${base64Image}\` } });
    }

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content }],
      temperature: 0.0,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/\`\`\`(?:json)?\\s*/g, '').replace(/\`\`\`\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Groq API extraction complete');

  } catch (err) {
    if (attempt < 4) {
      const fallbackModels = ['qwen/qwen3.8-27b', 'llama-3.2-90b-vision-preview', 'llama-3.2-11b-vision-preview', 'qwen-vl-72b'];
      const nextModel = fallbackModels[attempt];
      console.warn(\`[OCR] Groq failed with \${modelName} (\${err.message}) - retrying with \${nextModel}...\`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePaths, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }

  return {
    text: rawText,
    structuredData,
    confidence: 85,
    words: [],
    engine: 'groq',
    _fontMetrics: null,
  };
}

const ProductSchema = z.object({
  reasoning_log: z.string().nullable().optional(),
  meta_image_quality: z.string().nullable().optional(),
  visual_readability: z.string().nullable().optional(),
  meta_obstruction: z.string().nullable().optional(),
  meta_quality_reason: z.string().nullable().optional(),
  is_wholesale_or_multipiece_package: z.union([z.boolean(), z.string()]).nullable().optional(),
  manufacturer_name: z.string().nullable().optional(),
  manufacturer_address: z.string().nullable().optional(),
  common_name: z.string().nullable().optional(),
  net_quantity: z.union([z.string(), z.number()]).nullable().optional(),
  net_quantity_unit: z.string().nullable().optional(),
  mrp: z.union([z.string(), z.number()]).nullable().optional(),
  mrp_includes_tax_statement: z.union([z.boolean(), z.string()]).nullable().optional(),
  mfg_date: z.string().nullable().optional(),
  consumer_care_details: z.string().nullable().optional(),
}).passthrough();

const AIResponseSchema = z.object({
  products: z.array(ProductSchema).min(1, "Must detect at least one product")
});

async function runOcrPipeline(imagePaths, metadata = {}) {
  let processedPaths = [];
  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    for (const p of paths) {
      await validateResolution(p);
      processedPaths.push(await preprocessImage(p));
    }
    
    console.log("[OCR] Running primary Tesseract extraction...");
    let ocrResult = await runTesseract(processedPaths[0]).catch(err => {
      console.warn("[OCR] Tesseract failed: " + err.message);
      return { text: '', confidence: 0, engine: 'tesseract', _fontMetrics: [] };
    });
    
    const isGarbage = ocrResult.confidence < 50;
    const safeHint = isGarbage ? '' : ocrResult.text;
    
    if (config.groq?.enabled && config.groq?.apiKey) {
      console.log("[OCR] Attempting Groq Vision fallback...");
      try {
        const groqResult = await runGroqVision(processedPaths, 1, 'qwen/qwen3.8-27b', safeHint);
        return {
          text: ocrResult.text,
          engine: "groq",
          confidenceAvg: groqResult.confidence,
          geminiStructuredData: groqResult.structuredData, 
          _fontMetrics: ocrResult._fontMetrics || [],
          _jsonText: groqResult.text
        };
      } catch (groqErr) {
        console.warn("[OCR] Groq fallback failed: " + groqErr.message);
      }
    } 
    
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      console.log("[OCR] Attempting Gemini Vision fallback...");
      try {
        const geminiResult = await runGeminiVision(processedPaths, 1, 'gemini-1.5-flash-latest', safeHint);
        return {
          text: ocrResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          _fontMetrics: ocrResult._fontMetrics || [],
          _jsonText: geminiResult.text
        };
      } catch (geminiErr) {
        console.warn("[OCR] Gemini fallback failed: " + geminiErr.message);
      }
    }
    
    return ocrResult;
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

fs.writeFileSync('backend/services/ocr_service.js', prefix + newCode);
console.log("Successfully rewrote the entire backend half!");
