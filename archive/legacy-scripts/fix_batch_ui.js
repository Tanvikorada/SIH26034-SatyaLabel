const fs = require('fs');
let js = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

js = js.replace(
`<p className="text-text-secondary mb-6">We could not process this image. Please try again.</p>`,
`<p className="text-text-secondary mb-6">{batch?.error_message || "We could not process this image. Please try again."}</p>`
);

fs.writeFileSync('frontend/app/batch/[id]/page.jsx', js);
console.log("Updated Batch UI to show error_message!");
