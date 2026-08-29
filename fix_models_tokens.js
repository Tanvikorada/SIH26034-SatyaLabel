const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Fix Gemini models
js = js.replace(/'gemini-1.5-flash-latest'/g, "'gemini-1.5-flash'");
js = js.replace(/'gemini-1.5-pro-latest'/g, "'gemini-1.5-pro'");

// Fix Groq max_tokens
js = js.replace(/max_tokens: 1024/g, "max_tokens: 4096");

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed models and tokens!");
