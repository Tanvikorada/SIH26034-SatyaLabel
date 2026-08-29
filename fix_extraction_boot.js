const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

js = js.replace('/**\n * @deprecated\nfunction extractFieldsArray', '/**\n * @deprecated\n */\nfunction extractFieldsArray');
fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Fixed comment block!");
