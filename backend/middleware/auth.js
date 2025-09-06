const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!users[0].is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address'
      });
    }

    // Add user info to request
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware for optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, email, first_name, last_name, is_verified FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length > 0 && users[0].is_verified) {
        req.user = users[0];
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return error, just continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};