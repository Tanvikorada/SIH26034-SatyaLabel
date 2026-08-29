const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = "const batch = await Batch.findOne({ order: [['created_at', 'DESC']] });";
const replace = `const batch = await Batch.findOne({ order: [['created_at', 'DESC']] });
    const { Scan } = require('../models');
    const scan = await Scan.findOne({ where: { id: batch.id } }); // wait, scan id is not batch id
    const scans = await Scan.findAll({ order: [['created_at', 'DESC']], limit: 1 });
    res.json({ batch, latestScan: scans[0] });
    return;`;

js = js.replace(target, replace);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed debug-db for scan!");
