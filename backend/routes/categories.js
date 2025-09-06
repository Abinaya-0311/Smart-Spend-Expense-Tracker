const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoriesWithBudgets,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryUsage,
  getDefaultCategories
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

// @route   GET /api/categories/defaults
// @desc    Get default categories
// @access  Public
router.get('/defaults', getDefaultCategories);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', authenticateToken, validateCategory, createCategory);

// @route   GET /api/categories
// @desc    Get all categories for user
// @access  Private
router.get('/', authenticateToken, getCategories);

// @route   GET /api/categories/with-budgets
// @desc    Get categories with budget information
// @access  Private
router.get('/with-budgets', authenticateToken, getCategoriesWithBudgets);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', authenticateToken, getCategoryById);

// @route   GET /api/categories/:id/stats
// @desc    Get category statistics
// @access  Private
router.get('/:id/stats', authenticateToken, getCategoryStats);

// @route   GET /api/categories/:id/usage
// @desc    Get category usage over time
// @access  Private
router.get('/:id/usage', authenticateToken, getCategoryUsage);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', authenticateToken, validateCategory, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', authenticateToken, deleteCategory);

module.exports = router;