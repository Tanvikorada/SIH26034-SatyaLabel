const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// For Gemini
js = js.replace(
  /console\.warn\(\`\[OCR\] Gemini failed with \$\{modelName\} \(\$\{err\.message\}\) - retrying with \$\{nextModel\}\.\.\.\`\);/,
  "err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;\n        console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);"
);
js = js.replace(
  /return runGeminiVision\(imagePaths, attempt \+ 1, nextModel\);/,
  "return runGeminiVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });"
);

// For Groq
js = js.replace(
  /console\.warn\(\`\[OCR\] Groq failed with \$\{modelName\} \(\$\{err\.message\}\) - retrying with \$\{nextModel\}\.\.\.\`\);/,
  "err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;\n        console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);"
);
js = js.replace(
  /return runGroqVision\(imagePaths, attempt \+ 1, nextModel\);/,
  "return runGroqVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });"
);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed retry logging!");
