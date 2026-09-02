const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');

// Strip out that specific dynamic template literal string
code = code.replace(/dark:\$\{card\.color\.split\(' '\)\[1\]\?\.replace\('text-', 'bg-'\) \|\| ''\}/g, '');

fs.writeFileSync('frontend/app/dashboard/page.jsx', code);
