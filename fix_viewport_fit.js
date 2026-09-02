const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

code = code.replace(
  "export const viewport = {",
  "export const viewport = {\n  viewportFit: 'cover',"
);

fs.writeFileSync('frontend/app/layout.jsx', code);
console.log("VIEWPORT COVER ADDED");
