const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');
const idx = code.indexOf('label htmlFor="file-upload"');
console.log(code.substring(idx - 100, idx + 800));
