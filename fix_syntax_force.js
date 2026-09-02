const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

const startIdx = code.indexOf('export const viewport');
const endIdx = code.indexOf('export default function RootLayout');

if (startIdx !== -1 && endIdx !== -1) {
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  
  const newViewport = `export const viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};\n\n`;

  code = before + newViewport + after;
}

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("SYNTAX FORCED");
