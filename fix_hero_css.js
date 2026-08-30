const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const regex = /<div className="relative w-full max-w-\[380px\]/g;
if (code.match(regex)) {
  code = code.replace(regex, `<style>{\`
        @keyframes scan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
      \`}</style>
      <div className="relative w-full max-w-[380px]`);
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("CSS INJECTED");
} else {
  console.log("Could not find insertion point");
}
