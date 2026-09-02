const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');
code = code.replace(/emblem-3d\.jpg/g, 'emblem-official-v2.jpg');
fs.writeFileSync('frontend/app/page.jsx', code);
console.log("RENAMED");
