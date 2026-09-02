const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const regex = /<EvidenceImage src=\{img\.startsWith\('http'\) \? img : API\.replace\('\/api\/v1', ''\) \+ '\/' \+ img\} \/>/g;
const newImg = `<EvidenceImage src={img.startsWith('http') || img.startsWith('data:') ? img : API.replace('/api/v1', '') + '/' + img} />`;

if (code.match(regex)) {
  code = code.replace(regex, newImg);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
  console.log("BASE64 FIXED");
} else {
  console.log("NOT FOUND");
}
