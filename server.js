const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./src/config/db');
const { securityHeaders } = require('./src/middleware/security');
const { globalLimiter, loginLimiter } = require('./src/middleware/rateLimiter');
const { requireAuth, generateTokens, setAuthCookies } = require('./src/middleware/auth');
const { upload, validateImageMagicBytes } = require('./src/middleware/upload');
const { sanitizeLua } = require('./src/utils/sanitizeLua');

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'nexus-cookie-secret-key-2026';

// Trust proxy (required for Vercel/Render behind reverse proxy)
app.set('trust proxy', 1);

// 1. Logging Setup (Console logging)
app.use(morgan('dev'));

// 2. Security Headers & Global Rate Limiting
app.use(securityHeaders);
app.use(globalLimiter);

// 3. Parsers & Static Files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

// Disable directory listing & serve public assets
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// 4. View Engine Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 5. CSRF Protection Setup (Double-Submit Cookie Pattern)
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => COOKIE_SECRET,
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'] || req.body._csrf;
  }
});

// Middleware to inject CSRF token & AdSense environment keys into all views
app.use((req, res, next) => {
  try {
    res.locals.csrfToken = generateToken(req, res);
  } catch (err) {
    res.locals.csrfToken = '';
  }
  res.locals.adClientId = process.env.AD_CLIENT_ID || 'ca-pub-1234567890123456';
  res.locals.adSlotId = process.env.AD_SLOT_ID || '1234567890';
  res.locals.reqHeadersHost = req.headers.host || 'localhost:3000';
  res.locals.protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  next();
});


// ==========================================================================
// PUBLIC ROUTES
// ==========================================================================

// Homepage
app.get('/', async (req, res, next) => {
  try {
    const [maps] = await pool.execute(`
      SELECT m.*, COUNT(s.id) AS script_count
      FROM maps m
      LEFT JOIN scripts s ON m.id = s.map_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);

    const featuredMaps = maps.slice(0, 3);

    res.render('index', {
      maps,
      featuredMaps
    });
  } catch (err) {
    next(err);
  }
});

// Map Detail Page
app.get('/map/:id', async (req, res, next) => {
  try {
    const mapId = parseInt(req.params.id, 10);
    if (isNaN(mapId)) return res.status(404).render('404', { message: 'Invalid map ID' });

    const [maps] = await pool.execute('SELECT * FROM maps WHERE id = ?', [mapId]);
    if (maps.length === 0) {
      return res.status(404).render('404', { message: 'Game map not found' });
    }

    const map = maps[0];

    const [scripts] = await pool.execute(
      'SELECT * FROM scripts WHERE map_id = ? ORDER BY created_at DESC',
      [mapId]
    );

    // Log map view analytics
    await pool.execute(
      'INSERT INTO analytics (map_id, event_type) VALUES (?, ?)',
      [mapId, 'view']
    );

    // Check cookie watch status
    const isWatching = req.cookies[`sub_map_${mapId}`] === '1';

    res.render('map', {
      map,
      scripts,
      isWatching
    });
  } catch (err) {
    next(err);
  }
});

// Script Playground
app.get('/playground', async (req, res, next) => {
  try {
    const [maps] = await pool.execute('SELECT id, name FROM maps ORDER BY name ASC');
    res.render('playground', { maps });
  } catch (err) {
    next(err);
  }
});

// Smart Loadout Builder
app.get('/loadout', (req, res) => {
  res.render('loadout');
});

// Cookie Watchlist Subscription Endpoint
app.get('/subscribe/:mapId', (req, res) => {
  const mapId = parseInt(req.params.mapId, 10);
  if (!isNaN(mapId)) {
    const isWatching = req.cookies[`sub_map_${mapId}`] === '1';
    if (isWatching) {
      res.clearCookie(`sub_map_${mapId}`);
    } else {
      res.cookie(`sub_map_${mapId}`, '1', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    }
  }
  res.redirect(req.get('referer') || `/map/${mapId}`);
});

// ==========================================================================
// AJAX API ENDPOINTS
// ==========================================================================

// Instant Full-Text Visual Search API
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) return res.json([]);

  try {
    const searchTerm = `%${query}%`;
    const [results] = await pool.execute(`
      SELECT m.id, m.name, m.image, m.description, COUNT(s.id) AS script_count
      FROM maps m
      LEFT JOIN scripts s ON m.id = s.map_id
      WHERE m.name LIKE ? OR m.description LIKE ?
      GROUP BY m.id
      LIMIT 8
    `, [searchTerm, searchTerm]);

    res.json(results);
  } catch (err) {
    console.error('API search error:', err);
    res.status(500).json({ error: 'Search query error' });
  }
});

// Copy Analytics Logger API
app.post('/api/scripts/:id/copy-log', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  if (isNaN(scriptId)) return res.status(400).json({ error: 'Invalid script ID' });

  try {
    const [scripts] = await pool.execute('SELECT map_id FROM scripts WHERE id = ?', [scriptId]);
    const mapId = scripts.length > 0 ? scripts[0].map_id : null;

    await pool.execute(
      'INSERT INTO analytics (script_id, map_id, event_type) VALUES (?, ?, ?)',
      [scriptId, mapId, 'copy']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Copy log error:', err);
    res.status(500).json({ error: 'Failed to record analytics' });
  }
});

// Roblox Executor Direct Loadstring API Endpoint (Returns raw Lua code to executors)
app.get('/api/scripts/:id/load', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  if (isNaN(scriptId)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(400).send('-- Roblox Script Nexus: Invalid Script ID');
  }

  try {
    const [scripts] = await pool.execute('SELECT code FROM scripts WHERE id = ?', [scriptId]);
    if (scripts.length === 0) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(404).send('-- Roblox Script Nexus: Script not found');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(scripts[0].code);
  } catch (err) {
    console.error('Executor raw script load error:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('-- Roblox Script Nexus: Server Error loading script payload');
  }
});


// ==========================================================================
// ADMIN PORTAL ROUTES
// ==========================================================================

// Admin Login Form
app.get('/admin', (req, res) => {
  if (req.cookies.accessToken) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
});

// Admin Login Post Handler
app.post(
  '/admin/login',
  loginLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('admin/login', {
        error: errors.array()[0].msg
      });
    }

    const { username, password } = req.body;

    try {
      const [users] = await pool.execute(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).render('admin/login', {
          error: 'Invalid administrator credentials.'
        });
      }

      const adminUser = users[0];
      const match = await bcrypt.compare(password, adminUser.password_hash);

      if (!match) {
        return res.status(401).render('admin/login', {
          error: 'Invalid administrator credentials.'
        });
      }

      // Generate JWT tokens & set httpOnly cookies
      const tokens = generateTokens({ id: adminUser.id, username: adminUser.username });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).render('admin/login', { error: 'Internal server login error.' });
    }
  }
);

// Admin Sign Out
app.get('/admin/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.redirect('/admin');
});

// Admin Dashboard (Protected)
app.get('/admin/dashboard', requireAuth, async (req, res, next) => {
  try {
    const [[{ mapCount }]] = await pool.execute('SELECT COUNT(*) AS mapCount FROM maps');
    const [[{ scriptCount }]] = await pool.execute('SELECT COUNT(*) AS scriptCount FROM scripts');
    const [[{ copyCount }]] = await pool.execute('SELECT COUNT(*) AS copyCount FROM analytics WHERE event_type = "copy"');
    const [[{ viewCount }]] = await pool.execute('SELECT COUNT(*) AS viewCount FROM analytics WHERE event_type = "view"');

    const [maps] = await pool.execute('SELECT * FROM maps ORDER BY created_at DESC');
    const [scripts] = await pool.execute(`
      SELECT s.*, m.name AS map_name
      FROM scripts s
      JOIN maps m ON s.map_id = m.id
      ORDER BY s.created_at DESC
    `);

    // Top copied scripts stats
    const [topScripts] = await pool.execute(`
      SELECT s.title, m.name AS map_name, COUNT(a.id) AS copies
      FROM analytics a
      JOIN scripts s ON a.script_id = s.id
      JOIN maps m ON s.map_id = m.id
      WHERE a.event_type = 'copy'
      GROUP BY s.id
      ORDER BY copies DESC
      LIMIT 5
    `);

    // Top viewed maps stats
    const [topMaps] = await pool.execute(`
      SELECT m.name, COUNT(a.id) AS views
      FROM analytics a
      JOIN maps m ON a.map_id = m.id
      WHERE a.event_type = 'view'
      GROUP BY m.id
      ORDER BY views DESC
      LIMIT 5
    `);

    res.render('admin/dashboard', {
      user: req.user,
      stats: { mapCount, scriptCount, copyCount, viewCount },
      maps,
      scripts,
      topScripts,
      topMaps,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    next(err);
  }
});

// Admin Add Map (Protected, CSRF, File Upload)
app.post(
  '/admin/maps/add',
  requireAuth,
  upload.single('image'),
  validateImageMagicBytes,

  [
    body('name').trim().notEmpty().withMessage('Map name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`/admin/dashboard?error=${encodeURIComponent(errors.array()[0].msg)}`);
    }

    const { name, description } = req.body;
    const imagePath = req.file
      ? `/uploads/maps/${req.file.filename}`
      : 'https://via.placeholder.com/800x400/0a0a1a/00f0ff?text=' + encodeURIComponent(name);

    try {
      await pool.execute(
        'INSERT INTO maps (name, image, description) VALUES (?, ?, ?)',
        [name, imagePath, description || '']
      );
      res.redirect('/admin/dashboard?success=Map+created+successfully');
    } catch (err) {
      console.error('Add map error:', err);
      res.redirect('/admin/dashboard?error=Failed+to+create+map');
    }
  }
);

// Admin Delete Map (Protected, CSRF)
app.post('/admin/maps/delete/:id', requireAuth, async (req, res) => {
  const mapId = parseInt(req.params.id, 10);
  try {
    await pool.execute('DELETE FROM maps WHERE id = ?', [mapId]);
    res.redirect('/admin/dashboard?success=Map+deleted+successfully');
  } catch (err) {
    console.error('Delete map error:', err);
    res.redirect('/admin/dashboard?error=Failed+to+delete+map');
  }
});

// Admin Add Script (Protected, CSRF, Sanitized Lua Check)
app.post(
  '/admin/scripts/add',
  requireAuth,

  [
    body('title').trim().notEmpty().withMessage('Script title is required'),
    body('map_id').isInt().withMessage('Valid map selection is required'),
    body('code').notEmpty().withMessage('Script code is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`/admin/dashboard?error=${encodeURIComponent(errors.array()[0].msg)}`);
    }

    const { map_id, title, category, code, description } = req.body;

    // Security Sanitization check on Lua code
    const securityCheck = sanitizeLua(code);
    if (!securityCheck.valid) {
      return res.redirect(`/admin/dashboard?error=${encodeURIComponent(securityCheck.error)}`);
    }

    try {
      await pool.execute(
        'INSERT INTO scripts (map_id, title, category, code, description) VALUES (?, ?, ?, ?, ?)',
        [map_id, title, category || 'General', code, description || '']
      );
      res.redirect('/admin/dashboard?success=Script+published+successfully');
    } catch (err) {
      console.error('Add script error:', err);
      res.redirect('/admin/dashboard?error=Failed+to+publish+script');
    }
  }
);

// Admin Delete Script (Protected, CSRF)
app.post('/admin/scripts/delete/:id', requireAuth, async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  try {
    await pool.execute('DELETE FROM scripts WHERE id = ?', [scriptId]);
    res.redirect('/admin/dashboard?success=Script+deleted');
  } catch (err) {
    console.error('Delete script error:', err);
    res.redirect('/admin/dashboard?error=Failed+to+delete+script');
  }
});

// ==========================================================================
// 404 & ERROR HANDLING MIDDLEWARE
// ==========================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).render('index', {
    maps: [],
    featuredMaps: [],
    error: '404 - Requested page not found'
  });
});

// Production Error Handler (Hides stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500);
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({
      error: isProd ? 'Internal Server Error' : err.message
    });
  }

  res.render('admin/login', {
    error: isProd ? 'An unexpected server error occurred.' : err.message
  });
});

// Start Express Application Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Roblox Script Nexus Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

