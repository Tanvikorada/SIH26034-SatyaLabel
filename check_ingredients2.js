const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');
const idx = code.indexOf("activeTab === 'ingredients'");
console.log(code.substring(idx + 2500, idx + 5000));
