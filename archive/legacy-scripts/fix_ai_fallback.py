import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    js = f.read()

# I will add runGeminiVision right above runGroqVision
gemini_func = """async function runGeminiVision(imagePath, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  console.log(`[OCR] Calling Gemini REST API (${modelName}) (attempt ${attempt}/3).`);

  const imageBuffer = require('fs').readFileSync(imagePath);
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
    const payload = {
      contents: [{
        parts: [
          { text: STRUCTURED_PROMPT },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { temperature: 0.0 }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.gemini.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = { _raw_text: responseText };
      }
    } catch (parseErr) {
      structuredData = { _raw_text: responseText };
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Gemini API extraction complete');

  } catch (err) {
    if (attempt < 3) {
      const nextModel = modelName === 'gemini-1.5-flash-latest' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';
      console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGeminiVision(imagePath, attempt + 1, nextModel, tesseractText);
    }
    throw err;
  }

  return { text: rawText, structuredData, confidence: 85, words: [], engine: 'gemini', _fontMetrics: null };
}

async function runGroqVision"""

js = js.replace("async function runGroqVision", gemini_func)

fallback_old = """      // Fallback to Gemini/Groq
      if (true) {
        console.log("[OCR] Passing Tesseract text as a hint to Groq Vision for max accuracy...");
        try {
          
          // If Tesseract confidence is extremely low (< 50), it means the text is likely heavily distorted by glare.
          // Passing a pure garbage string as a hint causes Groq to hallucinate (e.g. guessing American Coke data).
          // So we only pass the hint if Tesseract was somewhat confident.
          const isGarbage = ocrResult.confidence < 50;
          const safeHint = isGarbage ? '' : ocrResult.text;
          if (isGarbage) console.log("[OCR] Tesseract confidence too low (" + ocrResult.confidence + "%). Hiding hint from Groq to prevent hallucinations.");
          const groqResult = await runGroqVision(processedPath, 1, 'llama-3.2-90b-vision-preview', safeHint);

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
      }"""

fallback_new = """      // Fallback to Groq or Gemini depending on configured keys
      const isGarbage = ocrResult.confidence < 50;
      const safeHint = isGarbage ? '' : ocrResult.text;
      if (isGarbage) console.log("[OCR] Tesseract confidence too low (" + ocrResult.confidence + "%). Hiding hint from Vision AI to prevent hallucinations.");
      
      if (config.groq?.enabled && config.groq?.apiKey) {
        console.log("[OCR] Attempting Groq Vision fallback...");
        try {
          const groqResult = await runGroqVision(processedPath, 1, 'llama-3.2-90b-vision-preview', safeHint);
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
          const geminiResult = await runGeminiVision(processedPath, 1, 'gemini-1.5-flash-latest', safeHint);
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
      }"""

js = js.replace(fallback_old, fallback_new)

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Fallback fixed")
