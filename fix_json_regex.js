const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

js = js.replace(
  /const jsonMatch = cleaned\.match\(\/\\\{\[\\s\\S\]\*\\\}\\/\);/g,
  "const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);"
);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Regex fixed");
