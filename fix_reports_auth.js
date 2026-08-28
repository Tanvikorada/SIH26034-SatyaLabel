const fs = require('fs');
let js = fs.readFileSync('backend/routes/reports.js', 'utf8');
js = js.split('optionalAuth').join('requireAuth');
fs.writeFileSync('backend/routes/reports.js', js);
console.log("optionalAuth globally replaced in reports.js");
