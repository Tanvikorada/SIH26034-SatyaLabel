const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const regex = /<style>\{\`\s*@keyframes scan \{[\s\S]*?\}\s*\`\}<\/style>\s*<div className="relative w-full max-w-\[380px\]/g;

if (code.match(regex)) {
  code = code.replace(regex, (match) => {
    return `<>\n      ${match}`;
  });
  
  // also add closing fragment
  const endRegex = /<\/div>\n  \);\n\}/g;
  code = code.replace(endRegex, '</div>\n    </>\n  );\n}');
  
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("JSX FIXED");
} else {
  console.log("Regex didn't match");
}
