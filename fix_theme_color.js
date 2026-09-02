const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

const oldViewport = `export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
    { media: '(prefers-color-scheme: dark)', color: '#090a0f' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}`;

const newViewport = `export const viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}`;

code = code.replace(oldViewport, newViewport);
fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("VIEWPORT FIXED");
