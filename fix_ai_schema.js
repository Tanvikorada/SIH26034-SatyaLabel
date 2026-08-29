const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const oldHint = '      fssai_license: "string",';
const newHint = `      fssai_license: "string",
      ingredient_analysis: {
        harmful_additives_found: ["string"],
        health_risks: ["string"],
        allergen_warnings: ["string"],
        is_clean_label: "boolean"
      },`;
code = code.replace(oldHint, newHint).replace(oldHint, newHint); // replace in both Gemini and Groq schema hints

const oldZod = '    mfg_date: z.string().nullable().optional(),';
const newZod = `    mfg_date: z.string().nullable().optional(),
    ingredient_analysis: z.object({
      harmful_additives_found: z.array(z.string()).nullable().optional(),
      health_risks: z.array(z.string()).nullable().optional(),
      allergen_warnings: z.array(z.string()).nullable().optional(),
      is_clean_label: z.boolean().nullable().optional()
    }).nullable().optional(),`;
code = code.replace(oldZod, newZod);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA FIXED");
