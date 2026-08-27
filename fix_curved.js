const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetStr = `if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
           fieldsMap._quality_warning = (fieldsMap._quality_warning || '') + ' Obstruction detected: ' + rawProductData.meta_obstruction;
        }`;

const replacement = `if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
           let reason = rawProductData.meta_obstruction;
           if (reason === 'partially_cut_off') reason = 'Curved surface / Edge cut off. Take multiple photos for full validation.';
           else if (reason === 'thumb_covering_text') reason = 'Thumb covering text detected.';
           fieldsMap._quality_warning = (fieldsMap._quality_warning ? fieldsMap._quality_warning + ' | ' : '') + 'Obstruction: ' + reason;
        }`;

if(js.includes(targetStr)) {
  js = js.replace(targetStr, replacement);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Curved surface fixed");
} else {
  console.log("Not found");
}
