const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const newRoute = `// ─── GET /api/v1/scans/batch/:id ────────────────────────────────────────────────────────
router.get('/batch/:id', optionalAuth, async (req, res) => {
  try {
    const { Batch, Scan, Product } = require('../models');
    const batch = await Batch.findByPk(req.params.id, {
      include: [{ 
        model: Scan, 
        as: 'scans',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!batch) return fail(res, 404, 'BATCH_NOT_FOUND', 'Batch not found');

    const formattedScans = (batch.scans || []).map(formatScanList);
    
    ok(res, {
      id: batch.id,
      status: batch.status,
      original_image: batch.originalImage,
      scans: formattedScans
    });
  } catch (err) {
    fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

`;

const idx = js.indexOf('// ─── GET /api/v1/scans');
js = js.substring(0, idx) + newRoute + js.substring(idx);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Batch route added");
