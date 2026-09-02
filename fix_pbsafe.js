const fs = require('fs');
let code = fs.readFileSync('frontend/app/globals.css', 'utf8');

const safeCSS = `
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
}
`;

code = code + safeCSS;
fs.writeFileSync('frontend/app/globals.css', code);
console.log("SAFE AREA CSS ADDED");
