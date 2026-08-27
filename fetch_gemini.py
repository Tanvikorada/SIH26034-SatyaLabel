import re

with open("backend/services/ocr_service.js", "r", encoding="utf-8") as f:
    ocr = f.read()

new_runGemini = """async function runGeminiVision(imagePath, attempt = 1, modelName = 'gemini-flash-latest') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  console.log(`[OCR] Calling Gemini REST API (${modelName}) (attempt ${attempt}/3).`);

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

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
  "consumer_care_details": string or null
}
If a field is not visible or not present on the label, return null for it.
Do not guess or hallucinate values - only extract what is actually visible in the image.`;

  const FULL_PROMPT = `${STRUCTURED_PROMPT}\\n\\nAdditionally include these extra fields in the same JSON object:
{
  "_raw_text": "<all text visible on the label, verbatim>",
  "brand_name": string or null,
  "best_before": string or null,
  "batch_lot_number": string or null,
  "fssai_license": string or null,
  "country_of_origin": string or null,
  "ingredients": string or null,
  "veg_nonveg": "veg" | "non-veg" | null
}
Respond with ONLY the complete JSON object. No markdown, no explanation.`;

  let rawText = '';
  let structuredData = {};

  try {
    const payload = {
      contents: [{
        parts: [
          { text: FULL_PROMPT },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }],
      generationConfig: {
        temperature: 0.1
      }
    };

    const controller = new AbortController();
    // Use 60-second timeout instead of 15 seconds to allow the flash model enough time to process
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
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = responseText.replace(/```(?:json)?\\s*/g, '').replace(/```\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/\\{[\\s\\S]*\\}/);
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
    console.log('[OCR] Gemini REST API extraction complete');

  } catch (err) {
    if (attempt < 3) {
      const nextModel = modelName === 'gemini-flash-latest' 
            ? 'gemini-3.7-flash' 
            : (modelName === 'gemini-3.7-flash' ? 'gemini-3.6-flash' : 'gemini-2.5-flash');
      
      console.warn(`[OCR] Gemini REST failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 1000));
      return runGeminiVision(imagePath, attempt + 1, nextModel);
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
"""

start_idx = ocr.find("async function runGeminiVision")
end_idx = ocr.find("/**\n * Full OCR pipeline")

if start_idx != -1 and end_idx != -1:
    ocr = ocr[:start_idx] + new_runGemini + ocr[end_idx:]

# Ensure MAX_DIMENSION_PX is 1024 to keep payloads small
ocr = ocr.replace("const MAX_DIMENSION_PX = 2000;", "const MAX_DIMENSION_PX = 1024;")

with open("backend/services/ocr_service.js", "w", encoding="utf-8") as f:
    f.write(ocr)
