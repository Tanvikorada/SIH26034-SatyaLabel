const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const s1 = `"meta_image_quality": "good" | "blurry" | "glare" | "too_far",`;
const r1 = `"meta_image_quality": "good" | "blurry" | "glare" | "too_far",
      "visual_readability": "excellent" | "poor_contrast" | "blurry_print",`;

js = js.split(s1).join(r1);
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Readability prompt added");
