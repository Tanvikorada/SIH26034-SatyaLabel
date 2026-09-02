const fs = require('fs');
let code = fs.readFileSync('services/ocr_service.js', 'utf8');

const groqFunctionStart = code.indexOf('async function runGroqVision');
if (groqFunctionStart === -1) {
    console.log("Could not find runGroqVision");
    process.exit(1);
}

const groqSchemaStart = code.indexOf('const SCHEMA_HINT = JSON.stringify({', groqFunctionStart);
const groqSchemaEnd = code.indexOf('}`;', groqSchemaStart) + 3;

const targetString = code.substring(groqSchemaStart, groqSchemaEnd);

const newSchema = `const SCHEMA_HINT = JSON.stringify({
  products: [{
    ai_summary: "string (A strictly detailed 4-6 sentence executive summary. You MUST explicitly state exactly WHICH rules passed and exactly WHY any rules failed. Do not sugarcoat. Be precise about legal metrology compliance.)",
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
    packer_name: "string",
    packer_address: "string",
    importer_name: "string",
    importer_address: "string",
    country_of_origin: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    ingredient_analysis: {
      harmful_additives_found: ["array of strings"],
      health_risks: ["array of strings"],
      allergens_detected: ["array of strings"],
      ingredient_dictionary: [{ name: "string", description: "string (1-2 sentence detailed scientific explanation of this ingredient's purpose and safety)" }]
    }
  }]
}, null, 2);

const STRUCTURED_PROMPT = \`You are an expert AI Food Inspector and Legal Metrology Compliance Auditor.
Your task is to analyze this product packaging image and extract EXACT structured data.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
\${SCHEMA_HINT}\`;`;

code = code.replace(targetString, newSchema);

// Now update the Zod Schema so it doesn't strip it out!
const zodSchemaStart = code.indexOf('const ProductSchema = z.object({');
const zodSchemaEnd = code.indexOf('}).passthrough();', zodSchemaStart);
const zodTargetString = code.substring(zodSchemaStart, zodSchemaEnd);

const newZodSchema = `const ProductSchema = z.object({
  ai_summary: z.string().nullable().optional(),
  raw_text_transcript: z.string().nullable().optional(),
  reasoning_log: z.string().nullable().optional(),
  meta_image_quality: z.string().nullable().optional(),
  visual_readability: z.string().nullable().optional(),
  meta_obstruction: z.string().nullable().optional(),
  meta_quality_reason: z.string().nullable().optional(),
  is_wholesale_or_multipiece_package: z.union([z.boolean(), z.string()]).nullable().optional(),
  manufacturer_name: z.string().nullable().optional(),
  manufacturer_address: z.string().nullable().optional(),
  packer_name: z.string().nullable().optional(),
  packer_address: z.string().nullable().optional(),
  importer_name: z.string().nullable().optional(),
  importer_address: z.string().nullable().optional(),
  country_of_origin: z.string().nullable().optional(),
  common_name: z.string().nullable().optional(),
  net_quantity: z.union([z.string(), z.number()]).nullable().optional(),
  net_quantity_unit: z.string().nullable().optional(),
  mrp: z.union([z.string(), z.number()]).nullable().optional(),
  mrp_includes_tax_statement: z.union([z.boolean(), z.string()]).nullable().optional(),
  mfg_date: z.string().nullable().optional(),
  ingredient_analysis: z.any().nullable().optional(),
  consumer_care_details: z.string().nullable().optional(),`;

code = code.replace(zodTargetString, newZodSchema);


fs.writeFileSync('services/ocr_service.js', code);
console.log("SCHEMA FIXED");
