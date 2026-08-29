const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const strToFind = "if (existingReport && fs.existsSync(existingReport.filePath)) {";

const idx = js.indexOf(strToFind);
if (idx !== -1) {
  const replaceStr = "if (false) { // CACHE DISABLED FOR HACKATHON";
  js = js.substring(0, idx) + replaceStr + js.substring(idx + strToFind.length);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("CACHE DISABLED");
} else {
  console.log("NOT FOUND");
}
