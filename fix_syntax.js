const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

// 1. Fix viewport block
const oldViewportRegex = /export const viewport = \{[\s\S]+?userScalable: false,\n\s*viewportFit: 'cover',\n\};/;
const newViewport = `export const viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};`;
code = code.replace(oldViewportRegex, newViewport);

// 2. Fix body tag syntax (extra })
code = code.replace('font-sans pb-24 md:pb-0`}}>', 'font-sans pb-24 md:pb-0`}>');

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("SYNTAX FIXED");
