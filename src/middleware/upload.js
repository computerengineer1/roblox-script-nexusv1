const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../../public/uploads/maps');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Unable to create upload directory on startup (this is expected in serverless environments):', err.message);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `map-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid image file type. Allowed: JPG, PNG, WEBP.'));
    }
    cb(null, true);
  }
});

// Middleware to perform deep magic-bytes file type verification using file-type package
async function validateImageMagicBytes(req, res, next) {
  if (!req.file) return next();

  try {
    const type = await fileType.fromFile(req.file.path);
    const allowedExts = ['jpg', 'png', 'webp'];
    if (!type || !allowedExts.includes(type.ext)) {
      // Delete invalid uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).render('admin/dashboard', {
        error: 'Uploaded file is not a valid image format.',
        csrfToken: req.csrfToken ? req.csrfToken() : ''
      });
    }
    next();
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

module.exports = { upload, validateImageMagicBytes };
