const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

js = js.replace(/in the `raw_text_transcript` field\./g, "in the 'raw_text_transcript' field.");

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed syntax!");
