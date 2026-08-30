import re

with open("backend/routes/scans.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Update POST / to create a Batch instead of a Scan
post_route_old = """        // Create scan record immediately (status = processing)
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

        // [Blueprint 05] Return 202 IMMEDIATELY
        // Frontend polls GET /scans/:id every 2s until status !== "processing"
        ok(res, { scan_id: scan.id, status: 'processing' }, 202);

        // [Blueprint 01] Fire pipeline async (after response sent)
        // We still pass req.file.path (the local file) to the OCR pipeline
        setImmediate(() => runScanPipeline(scan, req.file.path, { forceEngine: req.body.forceEngine }));"""

post_route_new = """        // Create batch record immediately
        const { Batch } = require('../models');
        const batch = await Batch.create({
          originalImage:    cloudUrl,
          uploadedBy:       req.user?.id || null,
          status:           'processing',
        });

        // Store hints on object
        batch.productNameHint = productNameHint;
        batch.brandNameHint   = brandNameHint;
        batch.sourceType      = sourceType;

        // Return batch_id instead of scan_id
        ok(res, { batch_id: batch.id, status: 'processing' }, 202);

        // Fire pipeline async
        setImmediate(() => runBatchPipeline(batch, req.file.path, { forceEngine: req.body.forceEngine }));"""

js = js.replace(post_route_old, post_route_new)

# 2. Add runBatchPipeline
pipeline_old = """async function runScanPipeline(scan, imagePath, metadata = {}) {"""

# We need to replace the entire runScanPipeline function. 
# It's better to just rewrite the file from scratch or use a heavy regex.

