const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const target = 'return pass(R, T, f, `Pixel bounding box mathematics indicate font ratio of ${estimatedRatio.toFixed(3)} (approx ${estimatedMm}mm), which exceeds the 1.0mm minimum.`);';
const replacement = 'return makeResult(R, T, f, S.PASS, null, `Pixel bounding box mathematics indicate font ratio of ${estimatedRatio.toFixed(3)} (approx ${estimatedMm}mm), which exceeds the 1.0mm minimum.`, "estimated");';

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync('backend/services/rules_engine.js', js);
  console.log("Fixed confidence bug!");
} else {
  console.log("Could not find target string.");
}
