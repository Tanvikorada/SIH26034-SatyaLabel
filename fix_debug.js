const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `    let crash = 'No crash';
    try {
      crash = require('fs').readFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), 'utf8');
    } catch (e) {}
    res.json({ err: global.lastInnerErr || "No error logged", crash });`;

const replace = `    let crash = 'No crash';
    let inner = 'No inner err';
    try {
      crash = require('fs').readFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), 'utf8');
    } catch (e) {}
    try {
      inner = require('fs').readFileSync('inner_err.log', 'utf8');
    } catch (e) {}
    res.json({ err: global.lastInnerErr || "No error logged", inner, crash });`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed debug err endpoint!");
} else {
  console.log("Could not find target!");
}
