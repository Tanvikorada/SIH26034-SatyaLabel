const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const targetRegex = /a\.download = \`Legal_Metrology_Notice_\$\{resolvedParams\.id\}\.pdf\`;\s*a\.click\(\);/g;
const replaceStr = `window.open(url, '_blank');`;

if (fe.match(targetRegex)) {
  fe = fe.replace(targetRegex, replaceStr);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("PREVIEW FIXED");
} else {
  console.log("NOT FOUND");
}
