const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace(
  "const formattedScans = (batch.scans || []).map(formatScanList);",
  "const formattedScans = (batch.scans || []).map(formatScanSummary);"
);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed!");
