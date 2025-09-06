const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  changePassword,
  deleteAccount
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegistration, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   PUT /api/auth/change-password
// @desc    Change password (authenticated user)
// @access  Private
router.put('/change-password', authenticateToken, changePassword);

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, deleteAccount);

module.exports = router;