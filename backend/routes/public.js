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


// TEMP DEBUG ROUTE
const { sequelize, QueryTypes } = require('../models');
router.get('/debug-network', async (req, res) => {
  try {
    const rawScans = await sequelize.query(`
      SELECT id, product_name, extracted_fields, overall_compliance
      FROM scans
      ORDER BY created_at DESC
      LIMIT 200
    `, { type: sequelize.QueryTypes || QueryTypes.SELECT });
    res.json({ success: true, count: rawScans.length, data: rawScans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});


router.get('/debug-batch/:id', async (req, res) => {
  try {
    const { Batch, Scan, Product } = require('../models');
    const batch = await Batch.findByPk(req.params.id, {
      include: [{ 
        model: Scan, 
        as: 'scans',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!batch) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});


router.post('/debug-url', async (req, res) => {
  try {
    const { url } = req.body;
    const axios = require('axios');
    const cheerio = require('cheerio');
    
    // 1. Scrape the URL
    const { data: html } = await axios.get(url, {
      timeout: 8000,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    const $ = cheerio.load(html);
    let imageUrl = $('meta[property="og:image"]').attr('content');
    
    if (!imageUrl) imageUrl = $('#landingImage').attr('src'); // Amazon
    if (!imageUrl) imageUrl = $('img').first().attr('src'); // Fallback
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Could not extract product image from URL.' });
    }
    
    if (imageUrl.startsWith('/')) {
       const urlObj = new URL(url);
       imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
    }

    // 2. Download the Image
    const { data: imageBuffer } = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 8000 
    });
    
    // Save to temp file so pipeline can process it
    const tempFileName = Date.now() + '_webpatrol.jpg';
    const tempPath = require('path').join(__dirname, '../uploads', tempFileName);
    require('fs').writeFileSync(tempPath, imageBuffer);
    
    const cUrl = 'data:image/jpeg;base64,' + imageBuffer.toString('base64');
    
    // 3. Create Batch
    const { Batch } = require('../models');
    const batch = await Batch.create({
      originalImage: JSON.stringify([cUrl]),
      uploadedBy: null,
      status: 'processing',
      latitude: null,
      longitude: null,
    });
    batch.productNameHint = 'debug product';
    batch.sourceType = 'ecommerce_listing';

    res.status(202).json({ success: true, data: { batch_id: batch.id, status: 'processing' } });

  } catch (err) {
    let msg = err.message;
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
       msg = 'Connection timed out.';
    } else if (err.response && (err.response.status === 403 || err.response.status === 503)) {
       msg = 'Blocked by anti-bot.';
    }
    res.status(500).json({ success: false, message: msg, stack: err.stack, originalError: err.message });
  }
});


router.get('/debug-recent', async (req, res) => {
  try {
    const { Batch, Scan } = require('../models');
    const batches = await Batch.findAll({
      order: [['created_at', 'DESC']],
      limit: 3,
      include: [{ model: Scan, as: 'scans' }]
    });
    res.json({ success: true, batches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;




