const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

// 1. Change upload.single('image') to upload.array('images', 4)
js = js.replace(/upload\.single\('image'\)/g, "upload.array('images', 4)");

// 2. Change req.file.path to req.files handling
const targetPost = `    if (!req.file) {
      return fail(res, 400, 'NO_IMAGE', 'No image file uploaded.');
    }

    // In a real app, upload to GCS/S3 here. For hackathon, we use local path.
    const cloudUrl = req.file.path; // e.g. "uploads/abc.jpg"`;

const replacePost = `    if (!req.files || req.files.length === 0) {
      return fail(res, 400, 'NO_IMAGE', 'No image files uploaded.');
    }

    // Store array of paths as a JSON string
    const filePaths = req.files.map(f => f.path);
    const cloudUrl = JSON.stringify(filePaths);`;

if (js.includes(targetPost)) {
  js = js.replace(targetPost, replacePost);
}

const targetImmediate = `setImmediate(() => runBatchPipeline(batch, req.file.path, { forceEngine: req.body.forceEngine }));`;
const replaceImmediate = `setImmediate(() => runBatchPipeline(batch, filePaths, { forceEngine: req.body.forceEngine }));`;
js = js.replace(targetImmediate, replaceImmediate);

// 3. Fix Scan.create imagePath
const targetCreate = `        const scan = await Scan.create({
          batchId:          batch.id,
          imagePath:        batch.originalImage,`;
const replaceCreate = `        let firstImage = batch.originalImage;
        try { firstImage = JSON.parse(batch.originalImage)[0]; } catch(e) {}
        
        const scan = await Scan.create({
          batchId:          batch.id,
          imagePath:        firstImage,`;
js = js.replace(targetCreate, replaceCreate);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Updated scans.js for multer array!");
