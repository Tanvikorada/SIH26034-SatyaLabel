const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Change default Gemini model
code = code.replace(/modelName = 'gemini-2\.5-flash'/g, "modelName = 'gemini-1.5-pro'");

// Fix the fallback logic
const oldLogic = "const nextModel = modelName === 'gemini-2.5-flash' ? 'gemini-3.5-flash' : 'gemini-2.5-flash';";
const newLogic = "const nextModel = modelName === 'gemini-1.5-pro' ? 'gemini-1.5-flash' : 'gemini-2.5-flash';";
code = code.replace(oldLogic, newLogic);

// Fix the recursive fallback call
code = code.replace(/runGeminiVision\(processedPaths, 1, 'gemini-2\.5-flash'\)/g, "runGeminiVision(processedPaths, attempt + 1, nextModel)");

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("GEMINI FIXED");
