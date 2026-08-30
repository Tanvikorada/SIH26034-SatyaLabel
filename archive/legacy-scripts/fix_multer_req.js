const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetReqFile = `      if (!req.file) {
        return fail(res, 400, 'MISSING_IMAGE', 'No image file uploaded - include field "image".');
      }
  
      const sourceType    = req.body.source_type || 'physical_label';`;

const replaceReqFile = `      if (!req.files || req.files.length === 0) {
        return fail(res, 400, 'MISSING_IMAGE', 'No image files uploaded - include field "images".');
      }
      
      const filePaths = req.files.map(f => f.path);
      const cloudUrl = JSON.stringify(filePaths);
  
      const sourceType    = req.body.source_type || 'physical_label';`;

if (js.includes(targetReqFile)) {
  js = js.replace(targetReqFile, replaceReqFile);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed req.file check!");
} else {
  console.log("Could not find target req.file");
}
