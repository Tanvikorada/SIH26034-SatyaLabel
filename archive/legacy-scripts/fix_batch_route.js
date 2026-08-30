const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace(
`      ok(res, {
        id: batch.id,
        status: batch.status,
        original_image: batch.originalImage,
        scans: formattedScans
      });`,
`      ok(res, {
        id: batch.id,
        status: batch.status,
        error_message: batch.errorMessage,
        original_image: batch.originalImage,
        scans: formattedScans
      });`
);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Updated Batch route to return error_message!");
