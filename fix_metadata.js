const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

const newMeta = `export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SatyaLabel',
  },
}`;

code = code.replace(/export const metadata = \{[\s\S]+?\}\n/m, newMeta + '\n');

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("METADATA FIXED");
