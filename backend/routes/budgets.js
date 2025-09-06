const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  getCurrentBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetSummary,
  toggleBudgetStatus
} = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');

// @route   POST /api/budgets
// @desc    Create new budget
// @access  Private
router.post('/', authenticateToken, validateBudget, createBudget);

// @route   GET /api/budgets
// @desc    Get all budgets for user
// @access  Private
router.get('/', authenticateToken, getBudgets);

// @route   GET /api/budgets/current
// @desc    Get current month budgets
// @access  Private
router.get('/current', authenticateToken, getCurrentBudgets);

// @route   GET /api/budgets/alerts
// @desc    Get budget alerts (over threshold)
// @access  Private
router.get('/alerts', authenticateToken, getBudgetAlerts);

// @route   GET /api/budgets/summary
// @desc    Get budget summary
// @access  Private
router.get('/summary', authenticateToken, getBudgetSummary);

// @route   GET /api/budgets/:id
// @desc    Get budget by ID
// @access  Private
router.get('/:id', authenticateToken, getBudgetById);

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', authenticateToken, validateBudget, updateBudget);

// @route   PATCH /api/budgets/:id/toggle
// @desc    Toggle budget active status
// @access  Private
router.patch('/:id/toggle', authenticateToken, toggleBudgetStatus);

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', authenticateToken, deleteBudget);

module.exports = router;