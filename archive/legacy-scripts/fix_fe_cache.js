const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const target = `const dlRes = await fetch(\`\${API.replace('/api/v1', '')}\${fileUrl}\`, {`;
const replace = `const dlRes = await fetch(\`\${API.replace('/api/v1', '')}\${fileUrl}?t=\${Date.now()}\`, {`;

if (fe.includes(target)) {
  fe = fe.replace(target, replace);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("FE CACHE FIXED");
} else {
  console.log("NOT FOUND");
}
