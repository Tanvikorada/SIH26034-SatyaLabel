// backend/middleware/auth.js
// JWT authentication middleware
const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth — attaches user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, config.jwt.secret);
    } catch (_) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, optionalAuth };
