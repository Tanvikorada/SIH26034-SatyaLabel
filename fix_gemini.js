const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');
code = code.replace("const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-2.5-flash' : 'gemini-2.5-flash';", "const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-1.5-flash' : 'gemini-1.5-pro';");
fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("FALLBACK ADDED");
