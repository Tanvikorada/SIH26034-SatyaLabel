const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// The original hint
const oldHint = `    ai_summary: "string (A 3-4 sentence detailed executive summary of the product's compliance state and overall health profile)",`;
const newHint = `    ai_summary: "string (A strictly detailed 4-6 sentence executive summary. You MUST explicitly state exactly WHICH rules passed and exactly WHY any rules failed. Do not sugarcoat. Be precise about legal metrology compliance.)",`;

const oldIngr = `    ingredient_analysis: {
      is_clean_label: "boolean (true if no synthetic chemicals or artificial preservatives)",
      harmful_additives_found: ["array of strings (e.g. E-numbers, INS codes, artificial colors)"],
      health_risks: ["array of strings (e.g. 'High sodium may cause hypertension', 'Contains trans fats')"],
      allergens_detected: ["array of strings (e.g. Milk, Peanuts, Soy)"]
    }`;
const newIngr = `    ingredient_analysis: {
      is_clean_label: "boolean (true if no synthetic chemicals or artificial preservatives)",
      harmful_additives_found: ["array of strings"],
      health_risks: ["array of strings"],
      allergens_detected: ["array of strings"],
      ingredient_dictionary: [{ name: "string", description: "string (1-2 sentence detailed scientific explanation of this ingredient's purpose and safety)" }]
    }`;

code = code.replace(oldHint, newHint).replace(oldIngr, newIngr);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("BACKEND ZOD UPDATED");
