const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Fix the corrupted block
const badBlock = `      if (config.gemini?.enabled && config.gemini?.apiKey) {
        console.log("[OCR] Waiting 2 seconds before retry to clear 503 spike...");
          await new Promise(r => setTimeout(r, 2000));
          console.log("[OCR] Attempting Gemini Vision with " + nextModel);
        try {`;

const goodBlock = `      if (config.gemini?.enabled && config.gemini?.apiKey) {
        console.log("[OCR] Attempting Gemini Vision...");
        try {`;

code = code.replace(badBlock, goodBlock);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("CLEANUP DONE");
