const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const s1 = `function checkLegibility(fields) {
  const R = 'Rule 9';
  const T = 'Legibility, Prominence and Readability of Declarations';
  const f = 'legibility';

  const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;`;

const r1 = `function checkLegibility(fields) {
  const R = 'Rule 9';
  const T = 'Legibility, Prominence and Readability of Declarations';
  const f = 'legibility';

  // AI Multimodal contrast analysis
  if (fields.visual_readability === 'poor_contrast') {
    return noncompliance(R, T, f, 'AI Vision Engine detected poor color contrast between the text and the packaging background, violating legibility requirements under Rule 9.');
  }
  if (fields.visual_readability === 'blurry_print') {
    return noncompliance(R, T, f, 'AI Vision Engine detected blurry or distorted print on the packaging, violating prominence requirements under Rule 9.');
  }

  const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;`;

js = js.split(s1).join(r1);
fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Rule 9 fixed");
