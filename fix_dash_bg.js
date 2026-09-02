const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');

code = code.replace(/dark:bg-\[#090a0f\]/g, 'dark:bg-black');

fs.writeFileSync('frontend/app/dashboard/page.jsx', code);
console.log("DASHBOARD BG FIXED");
