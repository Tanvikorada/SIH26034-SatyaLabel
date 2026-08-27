import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    routes = f.read()

test_route = '''
// Temporary debug route to test OCR natively
router.get('/debug-ocr', async (req, res) => {
  try {
    const { runOcrPipeline } = require('../services/ocr_service');
    // Create a tiny 1x1 image to test just the API connection
    const fs = require('fs');
    const tinyImagePath = './tiny.jpg';
    // 1x1 white pixel in base64
    const tinyBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    fs.writeFileSync(tinyImagePath, Buffer.from(tinyBase64, 'base64'));
    
    const start = Date.now();
    const result = await runOcrPipeline(tinyImagePath, {});
    const elapsed = Date.now() - start;
    
    res.json({ success: true, elapsed, result });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});
'''

# Insert it at the top, just after router initialization
routes = routes.replace('const router = express.Router();', 'const router = express.Router();\n\n' + test_route)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(routes)
