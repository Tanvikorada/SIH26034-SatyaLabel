const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

js = js.split("const jsonMatch = cleaned.match(/\\{[\\s\\S]*\\}/);").join("const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);");

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Regex fixed");
