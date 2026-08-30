const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

js = js.replace(/'Minor'/g, "'low'");
js = js.replace(/'Critical'/g, "'high'");
js = js.replace(/'Major'/g, "'medium'");

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Severity enum violations fixed");
