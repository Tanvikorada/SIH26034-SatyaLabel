const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const targetStr = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        } else {
          structuredData = { _raw_text: responseText };
        }
      } catch (e) {
        console.warn('[OCR] JSON parse failed, returning raw text.', e.message);
        structuredData = { _raw_text: responseText, _parse_error: e.message };
      }`;

const replaceStr = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
        const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
        structuredData = AIResponseSchema.parse(toValidate);
      } catch (parseErr) {
        console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
        throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
      }`;

js = js.replace(targetStr, replaceStr);
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Zod injected successfully");
