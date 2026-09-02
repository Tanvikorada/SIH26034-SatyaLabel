const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

// 1. Add icons to metadata
code = code.replace(
  "description: 'Legal Metrology Compliance Checker',",
  "description: 'Legal Metrology Compliance Checker',\n  icons: {\n    icon: '/icon.png',\n    shortcut: '/icon.png',\n    apple: '/icon.png',\n  },"
);

// 2. Change viewport themeColor
const oldViewportMatch = /export const viewport = \{[\s\S]*?\}/;
const newViewport = `export const viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}`;

code = code.replace(oldViewportMatch, newViewport);

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("LAYOUT RESTORED AND FIXED");
