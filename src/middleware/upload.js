const multer = require('multer');

// Memory storage works 100% on Vercel, Render, and local servers without disk limits
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB max
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      return cb(new Error('Invalid image file type. Allowed: JPG, PNG, WEBP, GIF.'));
    }
    cb(null, true);
  }
});

// Convert uploaded buffer to base64 Data URI
function processUploadedImage(file) {
  if (!file || !file.buffer) return null;
  const mimeType = file.mimetype || 'image/jpeg';
  const base64Str = file.buffer.toString('base64');
  return `data:${mimeType};base64,${base64Str}`;
}

module.exports = { upload, processUploadedImage };
