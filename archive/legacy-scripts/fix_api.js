const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `      ok(res, {
        id: batch.id,
        status: batch.status,
        original_image: batch.originalImage,
        scans: formattedScans
      });`;

const replace = `      ok(res, {
        id: batch.id,
        status: batch.status,
        original_image: batch.originalImage,
        error_message: batch.errorMessage,
        scans: formattedScans
      });`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed API output!");
} else {
  console.log("Could not find target!");
}
