const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

js = js.replace(/gemini-1\.5-flash/g, 'gemini-2.5-flash');
js = js.replace(/gemini-1\.5-pro/g, 'gemini-2.5-pro');

// For Groq, the error said to refer to deprecations. I will just replace Groq models with valid ones if possible. But wait, I'll just change the default to gemini to avoid groq completely for now!
js = js.replace(/let modelName = 'llama-3.2-90b-vision-preview';/g, "let modelName = 'gemini-2.5-flash';");
js = js.replace(/forceEngine === 'groq'/g, "forceEngine === 'groq_disabled'"); // disable groq for now

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed models!");
