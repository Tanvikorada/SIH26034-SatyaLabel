const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

code = code.replace(/gemini-2\.5-flash/g, 'gemini-3.1-pro-preview');
code = code.replace(/gemini-2\.5-pro/g, 'gemini-3.1-pro-preview');

code = code.replace(/llama-3\.2-90b-vision-instruct/g, 'llama-3.2-90b-vision-preview');
code = code.replace(/llama-3\.2-11b-vision-instruct/g, 'llama-3.2-11b-vision-preview');

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("MODELS UPDATED");
