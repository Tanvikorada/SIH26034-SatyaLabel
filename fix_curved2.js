const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s = `if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {`;
const e = `}`;

const sIdx = js.indexOf(s);
const eIdx = js.indexOf(e, sIdx);

const replacement = `if (rawProductData.meta_obstruction && rawProductData.meta_obstruction !== 'none') {
           let reason = rawProductData.meta_obstruction;
           if (reason === 'partially_cut_off') reason = 'Curved surface / Edge cut off. Take multiple photos for full validation.';
           else if (reason === 'thumb_covering_text') reason = 'Thumb covering text detected.';
           fieldsMap._quality_warning = (fieldsMap._quality_warning ? fieldsMap._quality_warning + ' | ' : '') + 'Obstruction: ' + reason;
        }`;

js = js.substring(0, sIdx) + replacement + js.substring(eIdx + 1);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Replaced via index");
