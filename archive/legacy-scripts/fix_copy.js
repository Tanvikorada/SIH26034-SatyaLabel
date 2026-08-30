const fs = require('fs');
let js = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

js = js.replace(/Images will be automatically stitched together\./g, "AI will synthesize all angles.");
js = js.replace(/'Stitching panorama\.\.\.'/g, "'Processing multi-angle context...'");

fs.writeFileSync('frontend/app/upload/page.jsx', js);
console.log("Fixed UI copy!");
