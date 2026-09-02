const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

code = code.replace(
  /\{\/\* Outer ambient glow \*\/\}\n\s*<div className="absolute inset-0 bg-blue-500\/20 dark:bg-blue-400\/10 rounded-full blur-\[80px\] animate-pulse" style=\{\{ animationDuration: '4s' \}\} \/>/,
  ''
);

fs.writeFileSync('frontend/app/page.jsx', code);
console.log("GLOW REMOVED");
