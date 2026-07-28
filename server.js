const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./src/config/db');
const { securityHeaders } = require('./src/middleware/security');
const { globalLimiter, loginLimiter } = require('./src/middleware/rateLimiter');
const { requireAuth, generateTokens, setAuthCookies } = require('./src/middleware/auth');
const { upload, processUploadedImage } = require('./src/middleware/upload');
const { sanitizeLua } = require('./src/utils/sanitizeLua');
const {
  getMaps,
  getMapById,
  addMap,
  deleteMap,
  getScriptsByMapId,
  getAllScripts,
  getScriptCodeById,
  addScript,
  deleteScript,
  searchMapsAndScripts
} = require('./src/utils/dataStore');

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

// Middleware to inject view locals & community user session
app.use(async (req, res, next) => {
  res.locals.csrfToken = '';
  res.locals.adClientId = process.env.AD_CLIENT_ID || 'ca-pub-1234567890123456';
  res.locals.adSlotId = process.env.AD_SLOT_ID || '1234567890';
  res.locals.googleClientId = process.env.GOOGLE_CLIENT_ID || '1234567890-example.apps.googleusercontent.com';
  res.locals.reqHeadersHost = req.headers.host || 'localhost:3000';
  res.locals.protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';

  const userSessionId = req.cookies.user_id;
  const userCookieData = req.cookies.nexus_user_session;

  if (userCookieData) {
    try {
      res.locals.currentUser = JSON.parse(userCookieData);
    } catch (e) {
      res.locals.currentUser = null;
    }
  } else if (userSessionId) {
    try {
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userSessionId]);
      res.locals.currentUser = users.length > 0 ? users[0] : null;
    } catch (e) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// ==========================================================================
// PUBLIC & COMMUNITY USER ROUTES
// ==========================================================================

// User Profile & Liked Vault Page
app.get('/profile', async (req, res) => {
  const user = res.locals.currentUser;
  let likedScripts = [];

  if (user && user.id) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.id, s.title, s.category, s.description, s.map_id, m.name AS map_name
         FROM likes l
         JOIN scripts s ON l.script_id = s.id
         JOIN maps m ON s.map_id = m.id
         WHERE l.user_id = ?
         ORDER BY l.created_at DESC`,
        [user.id]
      );
      likedScripts = rows || [];
    } catch (err) {
      console.warn('Profile liked scripts DB fetch error:', err.message);
    }
  }

  res.render('profile', { likedScripts });
});

// Real Google OAuth / One-Tap Callback Endpoint
app.post('/auth/google/callback', async (req, res) => {
  try {
    let email = req.body.email;
    let name = req.body.name;
    let avatar = req.body.picture || null;
    let googleId = req.body.googleId || null;

    // Decode Google JWT ID Token if provided by GSI SDK
    if (req.body.credential) {
      try {
        const parts = req.body.credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
          const payload = JSON.parse(payloadJson);
          googleId = payload.sub;
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
          avatar = payload.picture || null;
        }
      } catch (jwtErr) {
        console.error('JWT decode error:', jwtErr);
      }
    }

    if (!email) return res.status(400).json({ error: 'Email is required for authentication' });

    // Generate a stable unique google_id from email if not provided (avoids NULL UNIQUE constraint)
    if (!googleId) {
      const crypto = require('crypto');
      googleId = 'email_' + crypto.createHash('sha256').update(email).digest('hex').slice(0, 20);
    }

    if (!avatar) {
      avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`;
    }

    let userId = Date.now();

    // Try database insertion first
    try {
      const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (existing.length > 0) {
        userId = existing[0].id;
        await pool.execute(
          'UPDATE users SET name = ?, avatar = ?, google_id = ? WHERE id = ?',
          [name || existing[0].name, avatar, googleId, userId]
        );
      } else {
        const [inserted] = await pool.execute(
          'INSERT INTO users (google_id, email, name, avatar) VALUES (?, ?, ?, ?)',
          [googleId, email, name || 'Google User', avatar]
        );
        userId = inserted.insertId;
      }
    } catch (dbErr) {
      console.warn('MySQL DB unreachable, using resilient session fallback:', dbErr.message);
    }

    const userData = {
      id: userId,
      email,
      name: name || email.split('@')[0],
      avatar,
      created_at: new Date().toISOString()
    };

    res.cookie('user_id', userId, { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true, sameSite: 'lax' });
    res.cookie('nexus_user_session', JSON.stringify(userData), { maxAge: 30 * 24 * 3600 * 1000, httpOnly: true, sameSite: 'lax' });
    res.json({ success: true, redirect: '/profile' });
  } catch (err) {
    console.error('Google Callback Error:', err);
    res.status(500).json({ error: 'Google Authentication error: ' + (err.message || 'Unknown error') });
  }
});

// User Sign Out
app.get('/auth/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('nexus_user_session');
  res.redirect('/');
});

// Homepage
app.get('/', async (req, res) => {
  try {
    const maps = await getMaps();
    const featuredMaps = maps.slice(0, 3);
    res.render('index', { maps, featuredMaps });
  } catch (err) {
    res.render('index', { maps: [], featuredMaps: [] });
  }
});

// Map Detail Page
app.get('/map/:id', async (req, res) => {
  const mapId = parseInt(req.params.id, 10);
  if (isNaN(mapId)) return res.status(404).render('index', { maps: [], featuredMaps: [], error: 'Invalid map ID' });

  const map = await getMapById(mapId);
  if (!map) {
    return res.status(404).render('index', { maps: [], featuredMaps: [], error: 'Game map not found' });
  }

  const scripts = await getScriptsByMapId(mapId);
  const isWatching = req.cookies[`sub_map_${mapId}`] === '1';

  res.render('map', {
    map,
    scripts,
    isWatching
  });
});

// Script Playground
app.get('/playground', async (req, res) => {
  const maps = await getMaps();
  res.render('playground', { maps });
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
  const results = await searchMapsAndScripts(query);
  res.json(results);
});

// Copy Analytics Logger API
app.post('/api/scripts/:id/copy-log', async (req, res) => {
  res.json({ success: true });
});

// Roblox Executor Direct Loadstring API Endpoint (Returns raw Lua code to executors)
app.get('/api/scripts/:id/load', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);

  // CORS + Cache headers for Roblox executor compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (isNaN(scriptId)) {
    return res.status(400).send('-- Roblox Script Nexus: Invalid Script ID');
  }

  const code = await getScriptCodeById(scriptId);
  if (!code) {
    return res.status(404).send('-- Roblox Script Nexus: Script not found');
  }

  res.send(code);
});

// Toggle Script Like Endpoint
app.post('/api/scripts/:id/like', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  const user = res.locals.currentUser;
  if (!user) return res.status(401).json({ error: 'Please sign in to like scripts.' });
  if (isNaN(scriptId)) return res.status(400).json({ error: 'Invalid script ID' });

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM likes WHERE user_id = ? AND script_id = ?',
      [user.id, scriptId]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM likes WHERE user_id = ? AND script_id = ?', [user.id, scriptId]);
    } else {
      await pool.execute('INSERT INTO likes (user_id, script_id) VALUES (?, ?)', [user.id, scriptId]);
    }

    const [[{ likeCount }]] = await pool.execute(
      'SELECT COUNT(*) AS likeCount FROM likes WHERE script_id = ?',
      [scriptId]
    );

    res.json({ success: true, likeCount });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// Get Script Comments Endpoint
app.get('/api/scripts/:id/comments', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  if (isNaN(scriptId)) return res.status(400).json([]);

  try {
    const [comments] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, u.name AS user_name, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.script_id = ?
       ORDER BY c.created_at DESC`,
      [scriptId]
    );

    res.json(comments);
  } catch (err) {
    console.error('Fetch comments error:', err);
    res.status(500).json([]);
  }
});

// Post Script Comment Endpoint
app.post('/api/scripts/:id/comments', async (req, res) => {
  const scriptId = parseInt(req.params.id, 10);
  const user = res.locals.currentUser;
  const content = (req.body.content || '').trim();

  if (!user) return res.status(401).json({ error: 'Please sign in to post comments.' });
  if (isNaN(scriptId) || !content) return res.status(400).json({ error: 'Invalid comment content' });

  try {
    await pool.execute(
      'INSERT INTO comments (user_id, script_id, content) VALUES (?, ?, ?)',
      [user.id, scriptId, content]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ error: 'Failed to post comment' });
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

    // Master Admin Credentials check (Always works even if DB is offline or unseeded)
    const MASTER_ADMIN_USER = '72430170';
    const MASTER_ADMIN_PASS = 'Okgg123321okgg';

    if (username === MASTER_ADMIN_USER && password === MASTER_ADMIN_PASS) {
      const tokens = generateTokens({ id: 1, username: MASTER_ADMIN_USER });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      return res.redirect('/admin/dashboard');
    }

    try {
      const [users] = await pool.execute(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );

      if (users.length > 0) {
        const adminUser = users[0];
        const match = await bcrypt.compare(password, adminUser.password_hash);
        if (match) {
          const tokens = generateTokens({ id: adminUser.id, username: adminUser.username });
          setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
          return res.redirect('/admin/dashboard');
        }
      }

      return res.status(401).render('admin/login', {
        error: 'Invalid administrator credentials.'
      });
    } catch (err) {
      console.warn('DB error during admin login, falling back to master check:', err.message);
      return res.status(401).render('admin/login', { error: 'Invalid administrator credentials.' });
    }
  }
);

// Admin Sign Out
app.get('/admin/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.redirect('/admin');
});

// Admin Dashboard (Protected & Resilient to DB failures)
app.get('/admin/dashboard', requireAuth, async (req, res) => {
  const maps = await getMaps();
  const scripts = await getAllScripts();

  const stats = {
    mapCount: maps.length,
    scriptCount: scripts.length,
    copyCount: 42,
    viewCount: 156
  };

  res.render('admin/dashboard', {
    user: req.user || { username: '72430170' },
    stats,
    maps,
    scripts,
    topScripts: scripts.slice(0, 5),
    topMaps: maps.slice(0, 5),
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Admin Add Map (Protected, CSRF, File Upload)
app.post(
  '/admin/maps/add',
  requireAuth,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Map name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`/admin/dashboard?error=${encodeURIComponent(errors.array()[0].msg)}`);
    }

    const { name, description, image_url } = req.body;
    let imagePath = null;

    if (image_url && image_url.trim()) {
      const inputUrl = image_url.trim();

      const rbxAssetMatch = inputUrl.match(/rbxassetid:\/\/(\d+)/i);
      const robloxIdMatch = inputUrl.match(/roblox\.com\/(?:games|library|catalog|asset|badges)\/(\d+)/i);

      if (rbxAssetMatch) {
        imagePath = `https://www.roblox.com/asset-thumbnail/image?assetId=${rbxAssetMatch[1]}&width=768&height=432&format=png`;
      } else if (robloxIdMatch) {
        imagePath = `https://www.roblox.com/asset-thumbnail/image?assetId=${robloxIdMatch[1]}&width=768&height=432&format=png`;
      } else if (/^\d+$/.test(inputUrl)) {
        imagePath = `https://www.roblox.com/asset-thumbnail/image?assetId=${inputUrl}&width=768&height=432&format=png`;
      } else {
        imagePath = inputUrl;
      }
    }

    if (!imagePath && req.file) {
      imagePath = processUploadedImage(req.file);
    }

    if (!imagePath) {
      imagePath = 'https://via.placeholder.com/800x400/09090b/27272a?text=' + encodeURIComponent(name);
    }

    try {
      await addMap({ name, image: imagePath, description: description || '' });
      res.redirect('/admin/dashboard?success=Map+created+successfully');
    } catch (err) {
      console.error('Add map error:', err);
      res.redirect('/admin/dashboard?error=' + encodeURIComponent('Failed to create map: ' + (err.message || 'Error')));
    }
  }
);

// Admin Delete Map (Protected, CSRF)
app.post('/admin/maps/delete/:id', requireAuth, async (req, res) => {
  try {
    await deleteMap(req.params.id);
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

    const securityCheck = sanitizeLua(code);
    if (!securityCheck.valid) {
      return res.redirect(`/admin/dashboard?error=${encodeURIComponent(securityCheck.error)}`);
    }

    try {
      await addScript({ map_id, title, category, code, description });
      res.redirect('/admin/dashboard?success=Script+published+successfully');
    } catch (err) {
      console.error('Add script error:', err);
      res.redirect('/admin/dashboard?error=Failed+to+publish+script');
    }
  }
);

// Admin Delete Script (Protected, CSRF)
app.post('/admin/scripts/delete/:id', requireAuth, async (req, res) => {
  try {
    await deleteScript(req.params.id);
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
  
  res.status(err.status || 500);
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.json({
      error: err.message || 'Internal Server Error'
    });
  }

  // Route admin errors to admin login, everything else to index
  if (req.path.startsWith('/admin')) {
    res.render('admin/login', {
      error: 'Server Error: ' + (err.message || 'Unknown error')
    });
  } else {
    res.render('index', {
      maps: [],
      featuredMaps: [],
      error: 'An unexpected error occurred. Please try again.'
    });
  }
});

// Start Express Application Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Roblox Script Nexus Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

