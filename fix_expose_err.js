const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `router.get('/', requireAuth, async (req, res) => {`;
const r1 = `router.get('/debug-err', (req, res) => {
  res.json({ err: global.lastInnerErr || "No error logged" });
});
router.get('/', requireAuth, async (req, res) => {`;

js = js.replace(s1, r1);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Injected debug endpoint");
