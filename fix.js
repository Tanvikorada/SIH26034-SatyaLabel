const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');
code = code.replace(/if \(config\.groq\?\.enabled && config\.groq\?\.apiKey\) \{/g, "if (metadata.forceEngine === 'groq' && config.groq?.enabled && config.groq?.apiKey) {");
fs.writeFileSync('backend/services/ocr_service.js', code);
