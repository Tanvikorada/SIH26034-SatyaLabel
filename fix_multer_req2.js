const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace(/if \(!req\.file\) \{[\s\S]*?\}/, 
`if (!req.files || req.files.length === 0) {
        return fail(res, 400, 'MISSING_IMAGE', 'No image files uploaded - include field "images".');
      }
      const filePaths = req.files.map(f => f.path);
      const cloudUrl = JSON.stringify(filePaths);`);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed req.file using regex!");
