const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const target = `throw new Error('All OCR engines failed or are unconfigured.');`;
const replace = `throw new Error('All OCR engines failed. Groq: ' + (groqErrStr || 'disabled') + ' | Gemini: ' + (geminiErrStr || 'disabled'));`;

// Wait, groqErrStr is not defined. I need to capture it.
js = js.replace(`console.warn("[OCR] Groq failed: " + groqErr.message);`, `console.warn("[OCR] Groq failed: " + groqErr.message); groqErrStr = groqErr.message;`);
js = js.replace(`console.warn("[OCR] Gemini failed: " + geminiErr.message);`, `console.warn("[OCR] Gemini failed: " + geminiErr.message); geminiErrStr = geminiErr.message;`);

js = js.replace(`let groqResult = null;`, `let groqResult = null; let groqErrStr = ''; let geminiErrStr = '';`);
js = js.replace(target, replace);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed pipeline error logging!");
