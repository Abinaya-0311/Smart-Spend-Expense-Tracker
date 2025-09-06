const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const expenseRoutes = require('./expenses');
const categoryRoutes = require('./categories');
const budgetRoutes = require('./budgets');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSpend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SmartSpend API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        changePassword: 'PUT /api/auth/change-password',
        deleteAccount: 'DELETE /api/auth/account'
      },
      expenses: {
        create: 'POST /api/expenses',
        getAll: 'GET /api/expenses',
        getById: 'GET /api/expenses/:id',
        update: 'PUT /api/expenses/:id',
        delete: 'DELETE /api/expenses/:id',
        recent: 'GET /api/expenses/recent',
        stats: 'GET /api/expenses/stats',
        summaryByCategory: 'GET /api/expenses/summary/category',
        monthlyTrends: 'GET /api/expenses/trends/monthly'
      },
      categories: {
        create: 'POST /api/categories',
        getAll: 'GET /api/categories',
        getById: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
        defaults: 'GET /api/categories/defaults',
        withBudgets: 'GET /api/categories/with-budgets',
        stats: 'GET /api/categories/:id/stats',
        usage: 'GET /api/categories/:id/usage'
      },
      budgets: {
        create: 'POST /api/budgets',
        getAll: 'GET /api/budgets',
        getById: 'GET /api/budgets/:id',
        update: 'PUT /api/budgets/:id',
        delete: 'DELETE /api/budgets/:id',
        current: 'GET /api/budgets/current',
        alerts: 'GET /api/budgets/alerts',
        summary: 'GET /api/budgets/summary',
        toggle: 'PATCH /api/budgets/:id/toggle'
      }
    },
    examples: {
      authHeader: 'Authorization: Bearer your_jwt_token_here',
      baseURL: 'http://localhost:5000/api'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);

module.exports = router;