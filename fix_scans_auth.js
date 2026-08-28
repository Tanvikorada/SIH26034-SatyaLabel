const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');
js = js.split('optionalAuth').join('requireAuth');
fs.writeFileSync('backend/routes/scans.js', js);
console.log("optionalAuth globally replaced in scans.js");
