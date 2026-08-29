const fs = require('fs');
let js = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

// Remove the head injection I just added
js = js.replace(/<head>\s*<link rel="manifest" href="\/manifest\.json" crossOrigin="use-credentials" \/>\s*<\/head>/g, '');

// If there are any other manifest references, remove them
fs.writeFileSync('frontend/app/layout.jsx', js);
console.log("Removed manifest from layout");

if (fs.existsSync('frontend/public/manifest.json')) {
  fs.unlinkSync('frontend/public/manifest.json');
  console.log("Deleted manifest.json");
}
