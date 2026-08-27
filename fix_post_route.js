const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const oldPost = `        // Create scan record immediately (status = processing)
        const scan = await Scan.create({
          imagePath:        cloudUrl,
          originalFilename: req.file.originalname,
          uploadedBy:       req.user?.id || null,
          sourceType,
          status:           'processing',
        });

        // Store hints on object for pipeline (not in DB schema)
        scan.productNameHint = productNameHint;
        scan.brandNameHint   = brandNameHint;

        //  Return 202 IMMEDIATELY (spec 05) 
        // Frontend polls GET /scans/:id every 2s until status !== "processing"
        ok(res, { scan_id: scan.id, status: 'processing' }, 202);

        //  Fire pipeline async (after response sent) 
        // We still pass req.file.path (the local file) to the OCR pipeline
        setImmediate(() => runScanPipeline(scan, req.file.path, { forceEngine: req.body.forceEngine }));`;

const newPost = `        // Create batch record immediately
        const { Batch } = require('../models');
        const batch = await Batch.create({
          originalImage:    cloudUrl,
          uploadedBy:       req.user?.id || null,
          status:           'processing',
        });
        batch.productNameHint = productNameHint;
        batch.brandNameHint   = brandNameHint;
        batch.sourceType      = sourceType;

        // Return batch_id
        ok(res, { batch_id: batch.id, status: 'processing' }, 202);

        // Fire pipeline async
        setImmediate(() => runBatchPipeline(batch, req.file.path, { forceEngine: req.body.forceEngine }));`;

const fixed = js.replace(oldPost, newPost);
if (fixed === js) {
    console.log("Regex failed to match. Using fallback.");
    // Fallback: manually find setImmediate and ok
    let js2 = js.replace(/ok\(res, \{ scan_id: scan\.id, status: 'processing' \}, 202\);/g, "ok(res, { batch_id: scan.id, status: 'processing' }, 202);");
    js2 = js2.replace(/setImmediate\(\(\) => runScanPipeline\(scan, req\.file\.path, \{ forceEngine: req\.body\.forceEngine \}\)\);/g, "setImmediate(() => runBatchPipeline(scan, req.file.path, { forceEngine: req.body.forceEngine }));");
    fs.writeFileSync('backend/routes/scans.js', js2);
    console.log("Fallback used.");
} else {
    fs.writeFileSync('backend/routes/scans.js', fixed);
    console.log("Replaced perfectly.");
}
