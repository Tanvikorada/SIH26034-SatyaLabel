const fs = require('fs');
let js = fs.readFileSync('backend/middleware/upload.js', 'utf8');

js = js.replace(/files:\s*1,\s*\/\/\s*One image per request/g, "files: 4, // Max 4 images per request");

fs.writeFileSync('backend/middleware/upload.js', js);
console.log("Fixed multer limit!");
