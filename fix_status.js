const fs = require('fs');
let code = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

// Fix the return value of normalizeLegacyStatus
code = code.replace(/return 'estimated';/g, "return 'MANUAL REVIEW';");

// Fix the hardcoded status strings
code = code.replace(/status: 'estimated'/g, "status: 'MANUAL REVIEW'");

fs.writeFileSync('backend/services/rules_engine.js', code);
console.log("STATUS FIXED");
