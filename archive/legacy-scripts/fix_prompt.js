const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const target1 = 'You are analyzing an image that may contain ONE OR MORE consumer packaged goods.';
const replace1 = 'You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.';

js = js.split(target1).join(replace1);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed prompt!");
