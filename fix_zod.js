const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const target = `    ingredient_analysis: z.object({
      harmful_additives_found: z.array(z.string()).nullable().optional(),
      health_risks: z.array(z.string()).nullable().optional(),
      allergen_warnings: z.array(z.string()).nullable().optional(),
      is_clean_label: z.boolean().nullable().optional()
    }).nullable().optional(),`;

const replacement = `    ingredient_analysis: z.any().nullable().optional(),`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('backend/services/ocr_service.js', code);
  console.log("ZOD FIXED");
} else {
  console.log("TARGET NOT FOUND");
}
