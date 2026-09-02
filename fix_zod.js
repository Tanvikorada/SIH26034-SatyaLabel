const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Find the ingredients field in the schema string
const oldIng = `ingredients: "string",
    veg_nonveg: "string"`;

const newIng = `ingredients: "string",
    veg_nonveg: "string",
    ingredient_analysis: {
      is_clean_label: "boolean (true if no synthetic chemicals or artificial preservatives)",
      harmful_additives_found: ["array of strings (e.g. E-numbers, INS codes, artificial colors)"],
      health_risks: ["array of strings (e.g. 'High sodium may cause hypertension', 'Contains trans fats')"],
      allergens_detected: ["array of strings (e.g. Milk, Peanuts, Soy)"]
    }`;

code = code.replace(oldIng, newIng);

// Also add a directive to the prompt to ensure it generates this
const oldPrompt = `- Output ONLY valid JSON matching the schema below. No markdown formatting.`;
const newPrompt = `- Provide a deep, highly detailed biochemical breakdown in the ingredient_analysis section. If you see ingredients like Palmolein, INS codes, or artificial flavors, you MUST flag them in harmful_additives_found and list the corresponding health_risks.
- Output ONLY valid JSON matching the schema below. No markdown formatting.`;

code = code.replace(oldPrompt, newPrompt);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA FIXED");
