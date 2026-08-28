const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Inject Zod import at the top
if (!js.includes("const { z } = require('zod');")) {
  js = js.replace(/const config = require\('\.\.\/config\/settings'\);/, "const config = require('../config/settings');\nconst { z } = require('zod');");
}

const zodSchemaCode = `
// Zod Schema to strictly enforce AI output structure
const ProductSchema = z.object({
  reasoning_log: z.string().nullable().optional(),
  meta_image_quality: z.string().nullable().optional(),
  visual_readability: z.string().nullable().optional(),
  meta_obstruction: z.string().nullable().optional(),
  meta_quality_reason: z.string().nullable().optional(),
  is_wholesale_or_multipiece_package: z.union([z.boolean(), z.string()]).nullable().optional(),
  manufacturer_name: z.string().nullable().optional(),
  manufacturer_address: z.string().nullable().optional(),
  common_name: z.string().nullable().optional(),
  net_quantity: z.union([z.string(), z.number()]).nullable().optional(),
  net_quantity_unit: z.string().nullable().optional(),
  mrp: z.union([z.string(), z.number()]).nullable().optional(),
  mrp_includes_tax_statement: z.union([z.boolean(), z.string()]).nullable().optional(),
  mfg_date: z.string().nullable().optional(),
  consumer_care_details: z.string().nullable().optional(),
}).passthrough();

const AIResponseSchema = z.object({
  products: z.array(ProductSchema).min(1, "Must detect at least one product")
});
`;

if (!js.includes("const ProductSchema = z.object(")) {
  js = js.replace("async function runOcrPipeline", zodSchemaCode + "\nasync function runOcrPipeline");
}

const groqParseOld = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        } else {
          structuredData = { _raw_text: responseText };
        }
      } catch (parseErr) {
        console.warn('[OCR] JSON parse failed - using raw text');
        structuredData = { _raw_text: responseText };
      }`;

const groqParseNew = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        if (jsonMatch) {
          const rawParsed = JSON.parse(jsonMatch[0]);
          
          // Strict Zod Validation!
          // If the AI returned an object instead of { products: [...] }, wrap it safely
          const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
          structuredData = AIResponseSchema.parse(toValidate); 
        } else {
          throw new Error('No JSON brackets found in AI response.');
        }
      } catch (parseErr) {
        console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
        throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message); // This explicitly forces the outer catch to trigger a model retry!
      }`;

js = js.replace(groqParseOld, groqParseNew);

// Do the same for Gemini
const geminiParseOld = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
        } else {
          structuredData = { _raw_text: responseText };
        }
      } catch (parseErr) {
        structuredData = { _raw_text: responseText };
      }`;

js = js.replace(geminiParseOld, groqParseNew.replace("console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);", "console.warn('[OCR] Gemini JSON parse/Zod validation failed:', parseErr.message);"));

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Zod injected");
