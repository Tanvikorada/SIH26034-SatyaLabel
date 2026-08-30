const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. Add to prompt schemas (both Gemini and Groq)
code = code.replace(/fssai_license: "string",/g, `fssai_license: "string",\n    ingredient_analysis: {\n      harmful_additives_found: ["string"],\n      health_risks: ["string"],\n      allergen_warnings: ["string"],\n      is_clean_label: "boolean"\n    },`);

// 2. Add to Zod schema
code = code.replace(/mfg_date: z\.string\(\)\.nullable\(\)\.optional\(\),/g, `mfg_date: z.string().nullable().optional(),\n  ingredient_analysis: z.any().nullable().optional(),`);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA ACTUALLY FIXED");
