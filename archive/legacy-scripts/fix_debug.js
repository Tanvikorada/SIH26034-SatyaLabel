const fs = require('fs');
let code = fs.readFileSync('backend/routes/scans.js', 'utf8');

code = code.replace(/https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\?key="\s*\+\s*process\.env\.GEMINI_API_KEY/g, `"https://api.groq.com/openai/v1/models", { headers: { "Authorization": "Bearer " + process.env.GROQ_API_KEY } }`);

fs.writeFileSync('backend/routes/scans.js', code);
console.log("DEBUG FIXED");
