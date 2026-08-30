const fs = require('fs');
let js = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

js = js.replace(/const finalFile = await stitchImages\(files\);[\s\S]*?formData\.append\('image', finalFile\);/, `const formData = new FormData();\n      files.forEach(f => formData.append('images', f));`);

fs.writeFileSync('frontend/app/upload/page.jsx', js);
console.log("Fixed it using regex!");
