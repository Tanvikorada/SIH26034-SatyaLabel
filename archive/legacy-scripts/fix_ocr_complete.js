const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. Rewrite runGroqVision completely
const groqStart = js.indexOf('async function runGroqVision');
const geminiStart = js.indexOf('async function runGeminiVision');

const groqNew = `async function runGroqVision(imagePaths, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  let rawText = '';
  let structuredData = {};

  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    const content = [
      { type: "text", text: STRUCTURED_PROMPT + (tesseractText ? "\\n\\nHint text:\\n" + tesseractText : '') }
    ];
    for (const p of paths) {
      const b64 = require('fs').readFileSync(p).toString('base64');
      content.push({ type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${b64}\` } });
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

`;

// 2. Rewrite runGeminiVision completely
const geminiEnd = js.indexOf('const ProductSchema = z.object({');

const geminiNew = `async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  let rawText = '';
  let structuredData = {};

  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    const parts = [
      { text: STRUCTURED_PROMPT + (tesseractText ? "\\n\\nHint text:\\n" + tesseractText : '') }
    ];
    for (const p of paths) {
      const b64 = require('fs').readFileSync(p).toString('base64');
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } });
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

// Zod Schema to strictly enforce AI output structure
`;

js = js.substring(0, groqStart) + groqNew + geminiNew + js.substring(geminiEnd + 'const ProductSchema = z.object({'.length);
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Completely rewrote Groq and Gemini services!");
