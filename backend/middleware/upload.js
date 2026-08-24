// backend/middleware/upload.js
// ============================================================
// Multer image upload middleware — Spec 04 Step 1 constraints
// Accept: JPG/PNG only, max 10 MB
// Resolution check happens in ocr_service after disk write.
// ============================================================
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE_MB = 10; // Spec 04: max 10 MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // UUID filename prevents path traversal and naming collisions
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Spec 04: Accept JPG/PNG only
// (webp/bmp/tiff removed — not specified in spec; keeping simple for demo)
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = ['image/jpeg', 'image/png'].includes(file.mimetype);

  if (!allowed.includes(ext) || !mimeAllowed) {
    return cb(
      Object.assign(
        new Error(`Only JPG and PNG images are accepted. Received: ${file.mimetype || ext}`),
        { code: 'INVALID_FILE_TYPE' }
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // 10 MB
    files: 1,                                  // One image per request
  },
});

// ─── Error handler wrapper for Multer errors ─────────────────────────────────
// Call this instead of raw upload.single() in routes that want clean JSON errors
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large — maximum size is ${MAX_FILE_SIZE_MB}MB. Compress the image and try again.`,
        code: 'FILE_TOO_LARGE',
      });
    }
    return res.status(400).json({ error: err.message, code: err.code });
  }

  if (err?.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next();
}

module.exports = upload;
module.exports.handleUploadError = handleUploadError;
