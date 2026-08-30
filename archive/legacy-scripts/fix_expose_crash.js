const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `router.get('/debug-err', (req, res) => {
  res.json({ err: global.lastInnerErr || "No error logged" });
});`;
const r1 = `router.get('/debug-err', (req, res) => {
  let crash = 'No crash';
  try {
    crash = require('fs').readFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), 'utf8');
  } catch (e) {}
  res.json({ err: global.lastInnerErr || "No error logged", crash });
});`;

js = js.replace(s1, r1);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Injected crash reader");
