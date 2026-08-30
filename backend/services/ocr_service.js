// backend/services/ocr_service.js
// ============================================================
// OCR Pipeline — Spec 04 Implementation
// Step 1: Validate & Preprocess
// Step 2: Tesseract OCR (primary, fully offline, zero cost)
// Step 3: Gemini Vision fallback (only when Tesseract fails)
// Step 4: Graceful error handling for live demo safety
// SIH26034 — Legal Metrology Compliance Checker
// ============================================================


const sharp = require('sharp');

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { z } = require('zod');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_DIMENSION_PX = 720;          // Spec: resize to max 2000px on longest edge
const MIN_DIMENSION_PX = 600;           // Spec: reject below 600px shortest edge
const MIN_OCR_TEXT_LENGTH = 20;         // Below this = "no readable text"
const OCR_CONFIDENCE_THRESHOLD = config.ocr?.confidenceThreshold ?? 50; // % below which Gemini kicks in
        // 45s timeout for Gemini API call
const GEMINI_RETRY_ONCE = true;

// ─── STEP 1: IMAGE VALIDATION & PREPROCESSING ────────────────────────────────

/**
 * Validate image meets minimum resolution requirement (spec 04).
 * Throws clear, user-facing error if too low-res.
 *
 * @param {string} imagePath
 * @throws {Error} "IMAGE_TOO_LOW_RES" if shortest edge < MIN_DIMENSION_PX
 */
async function validateResolution(imagePath) {
  const meta = await sharp(imagePath).metadata();
  const { width, height } = meta;

  if (!width || !height) {
    throw Object.assign(
      new Error('Could not read image dimensions — the file may be corrupt.'),
      { code: 'IMAGE_UNREADABLE' }
    );
  }

  const shortest = Math.min(width, height);
  if (shortest < MIN_DIMENSION_PX) {
    throw Object.assign(
      new Error(
        `Image resolution too low (${width}×${height}px, shortest edge ${shortest}px). ` +
        `Please rescan with the camera closer to the label — minimum ${MIN_DIMENSION_PX}px on shortest edge required.`
      ),
      { code: 'IMAGE_TOO_LOW_RES', width, height }
    );
  }

  return { width, height };
}

/**
 * Preprocess image for OCR accuracy (spec 04 Step 1):
 *  - Auto-rotate via EXIF metadata (sharp handles this with .rotate())
 *  - Resize to max 2000px on longest edge (keeps aspect ratio)
 *  - Contrast enhancement (linear stretch + sharpen) for glossy/reflective packaging
 *
 * Returns path to temp preprocessed file. Caller must clean it up.
 *
 * @param {string} imagePath
 * @returns {string} processedPath
 */
async function preprocessImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath).toLowerCase() || '.jpg';
  const base = path.basename(imagePath, ext);
  const processedPath = path.join(dir, `${base}_ocr_ready${ext}`);

  const meta = await sharp(imagePath).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(imagePath)
    // Auto-rotate based on EXIF orientation (fixes phone photos taken sideways)
    .rotate();

  // Resize: only downscale (don't upscale low-res images — they'd just be blurry)
  if (longest > MAX_DIMENSION_PX) {
    pipeline = pipeline.resize(MAX_DIMENSION_PX, MAX_DIMENSION_PX, {
      fit: 'inside',        // Preserve aspect ratio, fit within 2000×2000
      withoutEnlargement: true,
    });
  }

  // Preprocessing for OCR accuracy:
  pipeline = pipeline
    .grayscale()                       // Remove color noise that confuses OCR
    .normalize()                       // Auto-stretch contrast (normalizes histogram)
    .sharpen({ sigma: 1.2, m1: 1.5 }) // Sharpen text edges
    .linear(1.15, -(128 * 1.15 - 128))
      .jpeg({ quality: 50 }); // Aggressive compression to slash base64 size and LLM token usage

  await pipeline.toFile(processedPath);

  const processedMeta = await sharp(processedPath).metadata();
  console.log(`[OCR] Preprocessed: ${meta.width}×${meta.height} → ${processedMeta.width}×${processedMeta.height}px`);

  return processedPath;
}

// ─── STEP 2: TESSERACT OCR (PRIMARY) ─────────────────────────────────────────



// ─── STEP 3: GEMINI VISION FALLBACK ──────────────────────────────────────────

/**
 * Spec 04 Step 3, Tier 2 — Gemini Vision structured extraction.
 *
 * Uses the EXACT prompt from spec file 04 for structured field extraction.
 * This is the fallback for when Tesseract+regex fails (messy/curved/low-contrast labels).
 *
 * Only called when:
 *   a) Tesseract confidence < OCR_CONFIDENCE_THRESHOLD, OR
 *   b) Tesseract text length < MIN_OCR_TEXT_LENGTH
 *
 * Free-tier discipline: called only when needed, not on every scan.
 *
 * @param {string} imagePath
 * @param {number} [attempt=1]
 * @param {string} [modelName='gemini-2.5-flash']
 * @returns {{ text, structuredData, confidence, engine }}
 */
// --- STEP 3: GROQ VISION FALLBACK ---


async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-2.5-flash') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const SCHEMA_HINT = JSON.stringify({
  products: [{
    raw_text_transcript: "string",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml)",
    mrp: "string or number",
    mrp_includes_tax_statement: "boolean or string",
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    ingredient_analysis: {
      harmful_additives_found: ["string"],
      health_risks: ["string"],
      allergen_warnings: ["string"],
      is_clean_label: "boolean"
    },
    country_of_origin: "string",
    ingredients: "string",
    veg_nonveg: "string",
    ingredient_analysis: {
      is_clean_label: "boolean (true if no synthetic chemicals or artificial preservatives)",
      harmful_additives_found: ["array of strings (e.g. E-numbers, INS codes, artificial colors)"],
      health_risks: ["array of strings (e.g. 'High sodium may cause hypertension', 'Contains trans fats')"],
      allergens_detected: ["array of strings (e.g. Milk, Peanuts, Soy)"]
    }
  }]
}, null, 2);

const STRUCTURED_PROMPT = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
${SCHEMA_HINT}`;

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
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.gemini.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
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
      const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
      err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;
        console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGeminiVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });
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

async function runGroqVision(imagePaths, attempt = 1, modelName = 'llama-3.3-70b-versatile') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const SCHEMA_HINT = JSON.stringify({
  products: [{
    raw_text_transcript: "string",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml)",
    mrp: "string or number",
    mrp_includes_tax_statement: "boolean or string",
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    ingredient_analysis: {
      harmful_additives_found: ["string"],
      health_risks: ["string"],
      allergen_warnings: ["string"],
      is_clean_label: "boolean"
    },
    country_of_origin: "string",
    ingredients: "string",
    veg_nonveg: "string"
  }]
}, null, 2);

const STRUCTURED_PROMPT = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
${SCHEMA_HINT}`;

  let rawText = '';
  let structuredData = {};

  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const content = [
      { type: "text", text: STRUCTURED_PROMPT }
    ];
    for (const p of paths) {
      const base64Image = require('fs').readFileSync(p).toString('base64');
      content.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } });
    }

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content }],
      temperature: 0.0,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
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
      const fallbackModels = ['llama-3.3-70b-versatile', 'llama-3.3-70b-versatile', 'llama-3.3-70b-versatile', 'llama-3.3-70b-versatile'];
      const nextModel = fallbackModels[attempt];
      err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;
        console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });
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
  raw_text_transcript: z.string().nullable().optional(),
  reasoning_log: z.string().nullable().optional(),
  meta_image_quality: z.string().nullable().optional(),
  visual_readability: z.string().nullable().optional(),
  meta_obstruction: z.string().nullable().optional(),
  meta_quality_reason: z.string().nullable().optional(),
  is_wholesale_or_multipiece_package: z.union([z.boolean(), z.string()]).nullable().optional(),
  manufacturer_name: z.string().nullable().optional(),
  manufacturer_address: z.string().nullable().optional(),
  packer_name: z.string().nullable().optional(),
  packer_address: z.string().nullable().optional(),
  importer_name: z.string().nullable().optional(),
  importer_address: z.string().nullable().optional(),
  country_of_origin: z.string().nullable().optional(),
  common_name: z.string().nullable().optional(),
  net_quantity: z.union([z.string(), z.number()]).nullable().optional(),
  net_quantity_unit: z.string().nullable().optional(),
  mrp: z.union([z.string(), z.number()]).nullable().optional(),
  mrp_includes_tax_statement: z.union([z.boolean(), z.string()]).nullable().optional(),
  mfg_date: z.string().nullable().optional(),
  ingredient_analysis: z.any().nullable().optional(),
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
    
    let groqResult = null; let groqErrStr = ''; let geminiErrStr = '';
    if (metadata.forceEngine === 'groq' && config.groq?.enabled && config.groq?.apiKey) {
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
        console.warn("[OCR] Groq failed: " + groqErr.message); groqErrStr = groqErr.message;
      }
    } 
    
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      console.log("[OCR] Attempting Gemini Vision...");
      try {
        const geminiResult = await runGeminiVision(processedPaths, 1, 'gemini-2.5-flash');
        return {
          text: geminiResult.structuredData?.products?.[0]?.raw_text_transcript || geminiResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          _fontMetrics: [],
          _jsonText: geminiResult.text
        };
      } catch (geminiErr) {
        console.warn("[OCR] Gemini failed: " + geminiErr.message); geminiErrStr = geminiErr.message;
      }
    }
    
    throw new Error('All OCR engines failed. Groq: ' + (groqErrStr || 'disabled') + ' | Gemini: ' + (geminiErrStr || 'disabled'));
  } finally {
    for (const p of processedPaths) {
      if (require('fs').existsSync(p)) {
        try { require('fs').unlinkSync(p); } catch (_) {}
      }
    }
  }
}

module.exports = { runOcrPipeline };
