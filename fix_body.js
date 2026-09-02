const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');
const search = '<body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>';
const replace = '<body className={`${inter.variable} ${sourceSerif.variable} font-sans pb-24 md:pb-0`}>';
code = code.replace(search, replace);
fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("FIXED");
