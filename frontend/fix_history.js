const fs = require('fs');
let code = fs.readFileSync('app/history/page.jsx', 'utf8');

code = code.replace('<div className="max-w-[1000px] mx-auto px-6 py-12">', '<div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-12">');
code = code.replace('text-[32px]', 'text-[24px] md:text-[32px]');

fs.writeFileSync('app/history/page.jsx', code);
console.log("HISTORY FIXED");
