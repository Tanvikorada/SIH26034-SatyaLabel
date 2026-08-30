import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

if "require('groq-sdk')" not in ocr:
    ocr = ocr.replace("const Tesseract = require('tesseract.js');", "const Tesseract = require('tesseract.js');\nconst Groq = require('groq-sdk');")

groq_function = r"""
// --- STEP 3: GROQ VISION FALLBACK ---

async function runGroqVision(imagePath, attempt = 1, modelName = 'llama-3.2-90b-vision-preview') {
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
  "consumer_care_details": string or null
}
If a field is not visible or not present on the label, return null for it.
Do not guess or hallucinate values - only extract what is actually visible in the image. Return ONLY valid JSON.`;

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
      temperature: 0.1,
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
      const nextModel = modelName === 'llama-3.2-90b-vision-preview' ? 'llama-3.2-11b-vision-preview' : 'llama-3.2-90b-vision-preview';
      console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePath, attempt + 1, nextModel);
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
"""

gemini_func_pattern = r'async function runGeminiVision.*?return \{\s*text: rawText,[\s\S]*?_fontMetrics: null,\s*\};\s*\}'
ocr = re.sub(gemini_func_pattern, lambda m: groq_function.strip(), ocr, flags=re.DOTALL)

pipeline_pattern = r'const geminiResult = await runGeminiVision\(processedPath\);\s*return \{\s*text: geminiResult\.text,\s*engine: "gemini",\s*confidenceAvg: geminiResult\.confidence,\s*geminiStructuredData: geminiResult\.structuredData,\s*_fontMetrics: ocrResult\._fontMetrics,\s*\};\s*\} catch \(geminiErr\) \{\s*console\.warn\("\[OCR\] Gemini fallback failed.*?"\);\s*\}'

new_pipeline_call = """const groqResult = await runGroqVision(processedPath);
        return {
          text: groqResult.text,
          engine: "groq",
          confidenceAvg: groqResult.confidence,
          geminiStructuredData: groqResult.structuredData, 
          _fontMetrics: ocrResult._fontMetrics,
        };
      } catch (groqErr) {
        console.warn("[OCR] Groq fallback failed: " + groqErr.message + ". Proceeding safely with Tesseract result.");
      }"""

ocr = re.sub(pipeline_pattern, lambda m: new_pipeline_call, ocr)

ocr = ocr.replace("Attempting Gemini fallback...", "Attempting Groq Vision fallback...")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)

print("Implemented Groq Vision safely")
