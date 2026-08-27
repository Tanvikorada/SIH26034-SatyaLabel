const fs = require('fs');
let js = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

js = js.replace(
  "setTimeout(() => router.push(`/results/${responseData.scan_id || responseData.id || 'mock'}`), 1000);",
  "setTimeout(() => router.push(`/batch/${responseData.batch_id || 'mock'}`), 1000);"
);

fs.writeFileSync('frontend/app/upload/page.jsx', js);
console.log("Upload route fixed");
