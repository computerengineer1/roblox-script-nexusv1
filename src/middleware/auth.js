const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function requireAuth(req, res, next) {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Access token expired or invalid, fall through to refresh token
    }
  }

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      // Token rotation: Issue new access & refresh tokens
      const userPayload = { id: decoded.id, username: decoded.username };
      const tokens = generateTokens(userPayload);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      req.user = userPayload;
      return next();
    } catch (err) {
      // Refresh token expired or invalid
    }
  }

  // If unauthorized
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(401).json({ error: 'Unauthorized access.' });
  }

  return res.redirect('/admin');
}

module.exports = {
  generateTokens,
  setAuthCookies,
  requireAuth
};
