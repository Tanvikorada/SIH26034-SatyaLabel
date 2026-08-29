const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const target = 'return noncompliance(R, T, f, `Computed letter height ratio (${estimatedRatio.toFixed(3)}) resolves to approx \\n${estimatedMm}mm, which is below the 1.0mm minimum threshold under Rule 7.`);';

// It might have a newline inside due to my original replace string or whatever. I'll just use regex.
js = js.replace(/return noncompliance\(R, T, f, `Computed letter height ratio \(\$\{estimatedRatio\.toFixed\(3\)\}\) resolves to approx \n?\$\{estimatedMm\}mm, which is below the 1\.0mm minimum threshold under Rule 7\.`\);/g, 
"return pnoc(R, T, f, 'high', `Computed letter height ratio (${estimatedRatio.toFixed(3)}) resolves to approx ${estimatedMm}mm, which is below the 1.0mm minimum threshold under Rule 7.`);");

js = js.replace(/return noncompliance\(/g, "return pnoc(");

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Fixed noncompliance bug!");
