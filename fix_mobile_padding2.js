const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

code = code.replace(/<body className=\{([^}]+)\}>/g, '<body className={$1 + " pb-20 md:pb-0"}>');

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("LAYOUT PADDING FIXED 2");
