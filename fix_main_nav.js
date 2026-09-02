const fs = require('fs');
let code = fs.readFileSync('frontend/components/NavBar.jsx', 'utf8');

const oldNavTitle = `<span className="text-[10px] font-mono tracking-[0.2em] text-white/60 uppercase mb-0.5">Dept. of Consumer Affairs</span>`;
const newNavTitle = `<span className="text-[10px] font-sans tracking-[0.05em] text-white/80 uppercase mb-0.5 font-medium">उपभोक्ता मामले विभाग • Dept. of Consumer Affairs</span>`;

if (code.includes(oldNavTitle)) {
  code = code.replace(oldNavTitle, newNavTitle);
} else {
  // Try a generic replace if tracking or classes differ
  code = code.replace(/<span className="[^"]*?">Dept\. of Consumer Affairs<\/span>/, newNavTitle);
}

fs.writeFileSync('frontend/components/NavBar.jsx', code);
console.log("NAVBAR BILINGUAL FIXED");
