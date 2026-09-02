const fs = require('fs');
let code = fs.readFileSync('services/rules_engine.js', 'utf8');

const regex = /const isPresent = \(val\) =>\s+val !== null && val !== undefined && String\(val\)\.trim\(\)\.length > 0;/;
const newText = `const isPresent = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim().toLowerCase();
    if (str.length === 0) return false;
    if (['null', 'none', 'n/a', 'na', 'not found', 'unspecified', 'not mentioned', 'unknown', 'missing', 'no detail provided.'].includes(str)) return false;
    return true;
  };`;

if (regex.test(code)) {
    code = code.replace(regex, newText);
    fs.writeFileSync('services/rules_engine.js', code);
    console.log("ISPRESENT FIXED");
} else {
    console.log("NOT FOUND");
}
