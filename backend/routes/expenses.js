const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummaryByCategory,
  getMonthlyTrends,
  getRecentExpenses,
  getExpenseStats
} = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', authenticateToken, validateExpense, createExpense);

// @route   GET /api/expenses
// @desc    Get all expenses for user with filters and pagination
// @access  Private
router.get('/', authenticateToken, getExpenses);

// @route   GET /api/expenses/recent
// @desc    Get recent expenses
// @access  Private
router.get('/recent', authenticateToken, getRecentExpenses);

// @route   GET /api/expenses/stats
// @desc    Get expense statistics
// @access  Private
router.get('/stats', authenticateToken, getExpenseStats);

// @route   GET /api/expenses/summary/category
// @desc    Get expense summary by category
// @access  Private
router.get('/summary/category', authenticateToken, getSummaryByCategory);

// @route   GET /api/expenses/trends/monthly
// @desc    Get monthly expense trends
// @access  Private
router.get('/trends/monthly', authenticateToken, getMonthlyTrends);

// @route   GET /api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', authenticateToken, getExpenseById);

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', authenticateToken, validateExpense, updateExpense);

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', authenticateToken, deleteExpense);

module.exports = router;