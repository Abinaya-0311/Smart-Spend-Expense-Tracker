const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Create new expense
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, categoryId, type = 'expense', description, date } = req.body;

    // Verify category exists and user can access it
    const canAccess = await Category.canAccess(categoryId, req.user.id);
    if (!canAccess) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const expenseId = await Expense.create({
      title,
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      type,
      description,
      date,
      userId: req.user.id
    });

    // Get the created expense with category info
    const expense = await Expense.findById(expenseId, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Get all expenses for user
const getExpenses = async (req, res, next) => {
  try {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const filters = {
      type,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      startDate,
      endDate,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      search,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const [expenses, totalCount] = await Promise.all([
      Expense.findByUser(req.user.id, filters),
      Expense.getCount(req.user.id, filters)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get expense by ID
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(parseInt(id), req.user.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Update expense
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, categoryId, type, description, date } = req.body;

    // Verify expense exists
    const existingExpense = await Expense.findById(parseInt(id), req.user.id);
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Verify category exists and user can access it
    const canAccess = await Category.canAccess(categoryId, req.user.id);
    if (!canAccess) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const updated = await Expense.update(parseInt(id), req.user.id, {
      title,
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      type,
      description,
      date
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update expense'
      });
    }

    // Get updated expense
    const expense = await Expense.findById(parseInt(id), req.user.id);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Expense.delete(parseInt(id), req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get expense summary by category
const getSummaryByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    // Default to current month if no dates provided
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const summary = await Expense.getSummaryByCategory(req.user.id, start, end, type);

    res.json({
      success: true,
      data: {
        summary,
        period: {
          startDate: start,
          endDate: end,
          type: type || 'all'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly trends
const getMonthlyTrends = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const trends = await Expense.getMonthlyTrends(req.user.id, parseInt(months));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// Get recent expenses
const getRecentExpenses = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const expenses = await Expense.getRecent(req.user.id, parseInt(limit));

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// Get expense statistics
const getExpenseStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const [summary, trends] = await Promise.all([
      Expense.getSummaryByCategory(req.user.id, start, end),
      Expense.getMonthlyTrends(req.user.id, 6)
    ]);

    // Calculate totals
    const totalExpenses = summary
      .filter(item => item.transaction_count > 0)
      .reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

    const totalTransactions = summary
      .reduce((sum, item) => sum + parseInt(item.transaction_count), 0);

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalTransactions,
        categorySummary: summary,
        monthlyTrends: trends,
        period: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummaryByCategory,
  getMonthlyTrends,
  getRecentExpenses,
  getExpenseStats
};