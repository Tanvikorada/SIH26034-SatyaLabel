const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

// Replace the style prop on the img tag that contains maskImage
const regex = /style=\{\{\s*maskImage:\s*'radial-gradient[^}]*\}\}/;
if (code.match(regex)) {
  code = code.replace(regex, '');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("MASK REMOVED");
} else {
  console.log("MASK NOT FOUND");
}
