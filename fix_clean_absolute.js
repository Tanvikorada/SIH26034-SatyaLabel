const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const regex = /if \(config\.gemini\?\.enabled && config\.gemini\?\.apiKey\) \{\s*console\.log\("\[OCR\] Waiting 2 seconds before retry to clear 503 spike\.\.\."\);\s*await new Promise\(r => setTimeout\(r, 2000\)\);\s*console\.log\("\[OCR\] Attempting Gemini Vision with " \+ nextModel\);\s*try \{/g;

code = code.replace(regex, 'if (config.gemini?.enabled && config.gemini?.apiKey) {\n        console.log("[OCR] Attempting Gemini Vision...");\n        try {');

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("REGEX CLEANUP DONE");
