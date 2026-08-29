const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const regex = /images = JSON\.parse\(imgStr\);\s*if \(\!Array\.isArray\(images\)\) images = \[imgStr\];/g;
const replace = `images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                  images = images.filter(Boolean); // protect against nulls`;

if (fe.match(regex)) {
  fe = fe.replace(regex, replace);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("FIXED NULL");
} else {
  console.log("REGEX FAILED");
}
