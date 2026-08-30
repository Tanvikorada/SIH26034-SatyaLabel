const fs = require('fs');
let code = fs.readFileSync('backend/routes/scans.js', 'utf8');

code = code.replace(/await fetch\(""\s*https:\/\/api\.groq\.com/g, 'await fetch("https://api.groq.com');

fs.writeFileSync('backend/routes/scans.js', code);
console.log("SYNTAX ERROR FIXED");
