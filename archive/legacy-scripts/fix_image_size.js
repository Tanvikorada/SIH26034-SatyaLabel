const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Reduce MAX_DIMENSION_PX from 1024 to 720 to drastically reduce LLM tokens
js = js.replace(/const MAX_DIMENSION_PX = 1024;/g, "const MAX_DIMENSION_PX = 720;");

// Add aggressive JPEG compression to the sharp pipeline
const target = `.linear(1.15, -(128 * 1.15 - 128)); // Mild contrast boost (helps on glossy packs)`;
const replace = `.linear(1.15, -(128 * 1.15 - 128))\n      .jpeg({ quality: 50 }); // Aggressive compression to slash base64 size and LLM token usage`;

js = js.replace(target, replace);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Image compression applied!");
