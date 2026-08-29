const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = "router.get('/debug-err', (req, res) => {";
const replace = `router.get('/debug-db', async (req, res) => {
  try {
    const { Batch } = require('../models');
    const batch = await Batch.findOne({ order: [['created_at', 'DESC']] });
    res.json(batch);
  } catch(e) { res.json({ error: e.message }); }
});

router.get('/debug-err', (req, res) => {`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Added debug-db!");
} else {
  console.log("Could not find target!");
}
