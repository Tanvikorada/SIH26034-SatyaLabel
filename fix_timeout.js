const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Fix timeout
js = js.replace(/setTimeout\(\(\) => controller\.abort\(\), 20000\)/g, "setTimeout(() => controller.abort(), 60000)");

// Fix model fallback
js = js.replace(/gemini-2\.5-pro/g, "gemini-3.5-flash");

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed timeout and model!");
