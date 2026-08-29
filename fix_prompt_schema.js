const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const targetPrompt = `const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
  You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.
  
  - Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.\`;`;

const newPrompt = `const SCHEMA_HINT = JSON.stringify({
  products: [{
    raw_text_transcript: "string",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml)",
    mrp: "string or number",
    mrp_includes_tax_statement: "boolean or string",
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    country_of_origin: "string",
    ingredients: "string",
    veg_nonveg: "string"
  }]
}, null, 2);

const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
\${SCHEMA_HINT}\`;`;

js = js.replace(/const STRUCTURED_PROMPT = `You are the core "AI Brain"[\s\S]*?'raw_text_transcript' field\.`;/g, newPrompt);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed prompt schema!");
