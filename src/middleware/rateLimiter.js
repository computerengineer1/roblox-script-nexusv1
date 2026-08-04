const rateLimit = require('express-rate-limit');
const pool = require('../config/db');

// Global rate limiter: 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict login rate limiter: 5 attempts per hour per IP with logging
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res /*, next, options */) => {
    const ip = req.ip || req.connection.remoteAddress;
    try {
      await pool.execute(
        'INSERT INTO login_attempts (ip_address) VALUES (?)',
        [ip]
      );
    } catch (err) {
      console.error('Failed to log rate-limited login attempt:', err.message);
    }

    req.flash ? req.flash('error', 'Too many failed login attempts. Try again in an hour.') : null;
    return res.status(429).render('admin/login', {
      error: 'Too many failed login attempts from your IP. Please try again in an hour.',
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  }
});

module.exports = { globalLimiter, loginLimiter };
