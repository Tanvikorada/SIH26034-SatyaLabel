const fs = require('fs');
let code = fs.readFileSync('app/page.jsx', 'utf8');

code = code.replace(/emblem-cutout\.jpg/g, 'emblem-transparent.png');
code = code.replace(/ mix-blend-multiply dark:invert dark:mix-blend-screen/g, '');

fs.writeFileSync('app/page.jsx', code);
console.log("HERO PNG FIXED");
