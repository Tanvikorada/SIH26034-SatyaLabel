const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Fix Gemini Timeout (60s -> 180s)
code = code.replace(/setTimeout\(\(\) => controller\.abort\(\), 60000\)/g, 'setTimeout(() => controller.abort(), 180000)');

// Fix Groq Default Model
code = code.replace(/modelName = 'qwen\/qwen3\.8-27b'/g, "modelName = 'llama-3.2-90b-vision-instruct'");
code = code.replace(/modelName = 'llama-3\.2-90b-vision-preview'/g, "modelName = 'llama-3.2-90b-vision-instruct'");

// Fix Groq Fallbacks
const oldFallbacks = `const fallbackModels = ['qwen/qwen3.8-27b', 'llama-3.2-90b-vision-preview', 'llama-3.2-11b-vision-preview', 'qwen-vl-72b'];`;
const newFallbacks = `const fallbackModels = ['llama-3.2-11b-vision-instruct', 'llama-3.2-90b-vision-instruct', 'llama-3.2-11b-vision-instruct', 'llama-3.2-11b-vision-instruct'];`;
code = code.replace(oldFallbacks, newFallbacks);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("MODELS AND TIMEOUT FIXED");
