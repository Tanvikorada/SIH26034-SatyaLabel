const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

code = code.replace(/await runGeminiVision\(processedPaths, attempt \+ 1, nextModel\);/g, "await runGeminiVision(processedPaths, 1, 'gemini-1.5-pro');");

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("REFERENCE ERROR FIXED");
