const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const regex = /<Image\s+src="\/emblem-3d\.jpg"/;
if (code.match(regex)) {
  code = code.replace(regex, '<Image unoptimized={true} src="/emblem-3d.jpg"');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("UNOPTIMIZED ADDED");
} else {
  console.log("NOT FOUND");
}
