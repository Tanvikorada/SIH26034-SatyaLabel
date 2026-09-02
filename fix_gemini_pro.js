const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// The line is: const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-1.5-flash-latest' : 'gemini-1.5-flash-latest';
code = code.replace(/const nextModel = modelName === 'gemini-2.5-flash' \? 'gemini-1.5-flash-latest' : 'gemini-1.5-flash-latest';/g, "const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-2.5-pro' : 'gemini-2.0-flash';");

// Also add a 2 second sleep before the retry to allow the 503 spike to clear!
code = code.replace(
  "console.log(\"[OCR] Attempting Gemini Vision...\");",
  "console.log(\"[OCR] Waiting 2 seconds before retry to clear 503 spike...\");\n        await new Promise(r => setTimeout(r, 2000));\n        console.log(\"[OCR] Attempting Gemini Vision with \" + nextModel);"
);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("PRO FALLBACK ADDED WITH DELAY");
