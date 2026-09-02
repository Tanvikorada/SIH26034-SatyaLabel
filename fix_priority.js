const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const groqBlock = `if (config.groq?.enabled && config.groq?.apiKey) {`;
const geminiBlock = `console.log("[OCR] Falling back to Gemini API...");`;

if (code.indexOf(groqBlock) < code.indexOf(geminiBlock)) {
  console.log("GROQ IS FIRST. Swapping priority to Gemini.");
  
  // We will just swap the order of the entire if-blocks.
  // Actually, an easier way is to just add a short-circuit to force Gemini if forceEngine isn't strictly Groq.
  
  code = code.replace(/if \(config\.groq\?\.enabled && config\.groq\?\.apiKey\) \{/g, `if (false && config.groq?.enabled && config.groq?.apiKey) { // TEMPORARILY DISABLED GROQ DUE TO HALLUCINATIONS`);
  
  fs.writeFileSync('backend/services/ocr_service.js', code);
  console.log("GEMINI FORCED");
} else {
  console.log("ALREADY FIXED");
}
