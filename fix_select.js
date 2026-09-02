const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

code = code.replace(
  /className="flex-1 font-mono text-\[12px\]/g, 
  'className="flex-1 font-mono text-[12px] allow-select cursor-text'
);

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("SELECT ALLOWED");
