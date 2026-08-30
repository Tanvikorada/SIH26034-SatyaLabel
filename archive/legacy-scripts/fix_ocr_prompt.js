const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const targetPrompt = `You are a strict legal metrology compliance auditor. 
  Extract all text from this FMCG product packaging image and map it to the following JSON schema.`;
const replacePrompt = `You are a strict legal metrology compliance auditor. 
  You may be provided with up to 4 images. These are DIFFERENT ANGLES of the EXACT SAME PRODUCT (e.g., front, back, sides). 
  Synthesize and combine the text across ALL images to fill out a single JSON object.
  Extract all text and map it to the following JSON schema.`;

js = js.replace(targetPrompt, replacePrompt);
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Updated OCR prompt!");
