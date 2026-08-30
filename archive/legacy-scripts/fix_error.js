const fs = require('fs');
let code = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `await batch.update({ status: 'failed' }).catch(() => {});`;
const replacement = `await batch.update({ status: 'failed', errorMessage: err.message }).catch(() => {});`;

const idx = code.indexOf(target);
if (idx !== -1) {
  code = code.substring(0, idx) + replacement + code.substring(idx + target.length);
  fs.writeFileSync('backend/routes/scans.js', code);
  console.log("FIXED");
} else {
  console.log("NOT FOUND");
}
