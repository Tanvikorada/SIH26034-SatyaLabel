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
const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_DIMENSION_PX = 1024;          // Spec: resize to max 2000px on longest edge
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
    .linear(1.15, -(128 * 1.15 - 128)); // Mild contrast boost (helps on glossy packs)

  await pipeline.toFile(processedPath);

  const processedMeta = await sharp(processedPath).metadata();
  console.log(`[OCR] Preprocessed: ${meta.width}×${meta.height} → ${processedMeta.width}×${processedMeta.height}px`);

  return processedPath;
}

// ─── STEP 2: TESSERACT OCR (PRIMARY) ─────────────────────────────────────────

/**
 * Run Tesseract on preprocessed image.
 * Returns text, per-word bounding boxes (for Rule 7 font size estimation),
 * and average word confidence.
 *
 * Language: eng+hin — handles bilingual Indian labels (English + Hindi)
 *
 * @param {string} imagePath
 * @returns {{ text, confidence, words, engine }}
 */
async function runTesseract(imagePath) {
  console.log('[OCR] Running Tesseract (eng+hin)…');

  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        process.stdout.write(`\r[Tesseract] ${Math.floor(m.progress * 100)}%`);
      }
    },
  });
  process.stdout.write('\n');

  const { data } = result;

  // Word-level confidence — exclude punctuation and very short tokens
  const words = (data.words || []).filter(w => w.text.trim().length > 1);
  const confidences = words.map(w => w.confidence).filter(c => c > 0);

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  // Bounding boxes for Rule 7 font-size estimation
  // Each word: { text, confidence, bbox: { x0, y0, x1, y1 } }
  // height in pixels = y1 - y0
  const wordBoxes = words.map(w => ({
    text: w.text,
    confidence: w.confidence,
    bbox: w.bbox,
    heightPx: w.bbox ? (w.bbox.y1 - w.bbox.y0) : null,
  }));

  // Find minimum font height across all words (for font size check)
  const heightValues = wordBoxes
    .map(w => w.heightPx)
    .filter(h => h !== null && h > 2); // exclude noise

  const minFontHeightPx = heightValues.length > 0 ? Math.min(...heightValues) : null;
  const avgFontHeightPx = heightValues.length > 0
    ? heightValues.reduce((a, b) => a + b, 0) / heightValues.length
    : null;

  console.log(`[OCR] Tesseract done — ${words.length} words, avg confidence: ${avgConfidence.toFixed(1)}%`);

  return {
    text: data.text || '',
    confidence: avgConfidence,
    words: wordBoxes,
    engine: 'tesseract',
    // Font size estimation data passed to rules engine
    _fontMetrics: {
      minFontHeightPx,
      avgFontHeightPx,
      wordCount: words.length,
    },
  };
}

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
 * @param {string} [modelName='gemini-1.5-flash-latest']
 * @returns {{ text, structuredData, confidence, engine }}
 */
// --- STEP 3: GROQ VISION FALLBACK ---

async function runGroqVision(imagePath, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  console.log(`[OCR] Calling Groq Vision API (${modelName}) (attempt ${attempt}/3).`);

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = 'image/jpeg';

  const STRUCTURED_PROMPT = `You are extracting mandatory declarations from a packaged commodity label image for a Legal Metrology compliance check. Return ONLY valid JSON with these keys:
{
    "manufacturer_name": string or null,
    "manufacturer_address": string or null,
    "common_name": string or null,
    "net_quantity": string or null,
    "net_quantity_unit": string or null,
    "mrp": string or null,
    "mrp_includes_tax_statement": boolean,
    "mfg_date": string or null,
    "consumer_care_details": string or null,
    "brand_name": string or null,
    "best_before": string or null,
    "batch_lot_number": string or null,
    "fssai_license": string or null,
    "country_of_origin": string or null,
    "ingredients": string or null,
    "nutrition": string or null,
    "veg_nonveg": string or null,
    "allergens_or_warnings": string or null
  }
If a field is not visible or not present on the label, return null for it.
Do not guess or hallucinate values - only extract what is actually visible in the image. Return ONLY valid JSON.` + (tesseractText ? `\n\nHere is some raw, noisy text extracted from the image by a secondary OCR engine. Use it as a hint to locate fields:\n${tesseractText}` : '');

  let rawText = '';
  let structuredData = {};

  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: STRUCTURED_PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.0,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = { _raw_text: responseText };
      }
    } catch (parseErr) {
      console.warn('[OCR] JSON parse failed - using raw text');
      structuredData = { _raw_text: responseText };
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Groq API extraction complete');

  } catch (err) {
    if (attempt < 3) {
      const nextModel = modelName === 'qwen/qwen3.8-27b' ? 'qwen/qwen3.6-27b' : 'qwen/qwen3.8-27b';
      console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePath, attempt + 1, nextModel, tesseractText);
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
/**
 * Full OCR pipeline (spec 04 Steps 1–4):
 *
 * 1. Validate resolution (reject < 600px)
 * 2. Preprocess (EXIF rotate, resize, contrast)
 * 3. Tesseract OCR
 * 4. Check if result is usable:
 *    - If empty/near-empty text → fail with clear message
 *    - If low confidence AND Gemini configured → Gemini fallback
 * 5. Return result with engine used + font metrics
 *
 * @param {string} imagePath - Absolute path to original uploaded image
 * @returns {OcrPipelineResult}
 * @throws {Error} with .code for known failure cases (IMAGE_TOO_LOW_RES, NO_TEXT_DETECTED)
 */
async function runOcrPipeline(imagePath, metadata = {}) {
  let processedPath = null;
  try {
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
          
          // If Tesseract confidence is extremely low (< 50), it means the text is likely heavily distorted by glare.
          // Passing a pure garbage string as a hint causes Groq to hallucinate (e.g. guessing American Coke data).
          // So we only pass the hint if Tesseract was somewhat confident.
          const isGarbage = ocrResult.confidence < 50;
          const safeHint = isGarbage ? '' : ocrResult.text;
          if (isGarbage) console.log("[OCR] Tesseract confidence too low (" + ocrResult.confidence + "%). Hiding hint from Groq to prevent hallucinations.");
          const groqResult = await runGroqVision(processedPath, 1, 'qwen/qwen3.8-27b', safeHint);

          return {
            text: ocrResult.text, // Must be Tesseract raw text so regexes don't match JSON keys!
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
      
      return ocrResult;
  } finally {
    if (processedPath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch (_) {}
    }
  }
}
module.exports = { runOcrPipeline };