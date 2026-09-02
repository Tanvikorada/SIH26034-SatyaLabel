const fs = require('fs');
let code = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

code = code.replace(/if \(c === 'estimated'\) return 'MANUAL REVIEW';/g, "if (c === 'estimated') return 'estimated';");

fs.writeFileSync('backend/services/rules_engine.js', code);
console.log("CONFIDENCE NORMALIZER FIXED");
