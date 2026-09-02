const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const regex = /className="relative w-full max-w-\[420px\] aspect-square/g;
if (code.match(regex)) {
  code = code.replace(regex, 'className="relative w-[280px] sm:w-[360px] md:w-[420px] aspect-square');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("CSS FIXED");
} else {
  console.log("CSS NOT FOUND");
}
