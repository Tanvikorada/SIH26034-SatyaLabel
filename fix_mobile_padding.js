const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

// The easiest way is to add pb-20 to the body, or add it to the wrapper.
// But we should only add pb-20 on mobile (md:pb-0).
code = code.replace(/<body className="([^"]+)">/g, '<body className="$1 pb-20 md:pb-0">');

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("LAYOUT PADDING FIXED");
