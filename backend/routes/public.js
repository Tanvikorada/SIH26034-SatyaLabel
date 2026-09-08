const express = require('express');
const multer = require('multer');
const { runBatchPipeline } = require('../services/ocr_service');
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, status, code, msg) => res.status(status).json({ error: { code, message: msg } });

// Memory storage so we can upload immediately to Supabase
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// ==========================================
// PHASE 2 UPGRADE: Citizen Reporting Portal
// ==========================================
router.post('/report', (req, res, next) => {
  upload.array('images', 1)(req, res, async (uploadErr) => {
    if (uploadErr) {
      return fail(res, 400, 'UPLOAD_ERROR', uploadErr.message);
    }

    if (!req.files || req.files.length === 0) {
      return fail(res, 400, 'MISSING_IMAGE', 'No image file uploaded');
    }
    const f = req.files[0];
    
    try {
      const fileBuffer = require('fs').readFileSync(f.path);
      const cUrl = 'data:' + f.mimetype + ';base64,' + fileBuffer.toString('base64');
      
      const { Batch } = require('../models');
      const batch = await Batch.create({
        originalImage: JSON.stringify([cUrl]),
        uploadedBy: null, // Public anonymous upload
        status: 'processing',
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      });
      batch.productNameHint = "Public Report";
      batch.sourceType = 'physical_label';

      ok(res, { batch_id: batch.id, status: 'processing' }, 202);

      setImmediate(() => runBatchPipeline(batch, [f.path], {}));
    } catch (err) {
      return fail(res, 500, 'INTERNAL_ERROR', err.message);
    }
  });
});

module.exports = router;
