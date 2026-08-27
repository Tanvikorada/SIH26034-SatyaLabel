const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const oldSummary = `      ocr_engine: scan.ocrEngineUsed,
      created_at: scan.created_at,
    };`;
const newSummary = `      ocr_engine: scan.ocrEngineUsed,
      created_at: scan.created_at,
      extracted_fields: scan.extractedFields,
    };`;

js = js.replace(oldSummary, newSummary);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Summary fixed");
