const fs = require('fs');
let css = fs.readFileSync('frontend/app/globals.css', 'utf8');
if (css.indexOf('@keyframes slideRight') === -1) {
  css += `\n@keyframes slideRight {\n  0% { transform: translateX(0%); }\n  100% { transform: translateX(200%); }\n}\n`;
  fs.writeFileSync('frontend/app/globals.css', css);
}
