const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace(/v\.ruleId/g, 'v.rule_id || v.ruleId');
js = js.replace(/v\.ruleTitle/g, 'v.rule_title || v.ruleTitle');
js = js.replace(/v\.affectedField/g, 'v.field || v.affectedField');

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Violations loop fixed");
