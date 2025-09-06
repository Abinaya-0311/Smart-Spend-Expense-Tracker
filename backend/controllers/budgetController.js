const Budget = require('../models/Budget');
const Category = require('../models/Category');

// Create new budget
const createBudget = async (req, res, next) => {
  try {
    const { categoryId, amount, period = 'monthly', startDate, endDate } = req.body;

    // Verify category exists and user can access it
    const canAccess = await Category.canAccess(categoryId, req.user.id);
    if (!canAccess) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Check if budget already exists for this category and period
    const exists = await Budget.existsForCategoryAndPeriod(
      categoryId, 
      req.user.id, 
      period, 
      startDate
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    const budgetId = await Budget.create({
      categoryId: parseInt(categoryId),
      userId: req.user.id,
      amount: parseFloat(amount),
      period,
      startDate,
      endDate
    });

    const budget = await Budget.getWithSpending(budgetId, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Get all budgets for user
const getBudgets = async (req, res, next) => {
  try {
    const { isActive, period, categoryId } = req.query;

    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (period) filters.period = period;
    if (categoryId) filters.categoryId = parseInt(categoryId);

    const budgets = await Budget.findByUser(req.user.id, filters);

    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// Get current month budgets
const getCurrentBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.getCurrentMonth(req.user.id);

    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// Get budget by ID
const getBudgetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const budget = await Budget.getWithSpending(parseInt(id), req.user.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Update budget
const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, period, startDate, endDate, isActive } = req.body;

    // Check if budget exists
    const existingBudget = await Budget.findById(parseInt(id), req.user.id);
    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const updated = await Budget.update(parseInt(id), req.user.id, {
      amount: parseFloat(amount),
      period,
      startDate,
      endDate,
      isActive
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update budget'
      });
    }

    const budget = await Budget.getWithSpending(parseInt(id), req.user.id);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// Delete budget
const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Budget.delete(parseInt(id), req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get budget alerts
const getBudgetAlerts = async (req, res, next) => {
  try {
    const { threshold = 80 } = req.query;
    const alerts = await Budget.getAlerts(req.user.id, parseFloat(threshold));

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// Get budget summary
const getBudgetSummary = async (req, res, next) => {
  try {
    const summary = await Budget.getSummary(req.user.id);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Toggle budget active status
const toggleBudgetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current budget
    const budget = await Budget.findById(parseInt(id), req.user.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Toggle status
    const updated = await Budget.update(parseInt(id), req.user.id, {
      amount: budget.amount,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date,
      isActive: !budget.is_active
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update budget status'
      });
    }

    const updatedBudget = await Budget.getWithSpending(parseInt(id), req.user.id);

    res.json({
      success: true,
      message: `Budget ${updatedBudget.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getCurrentBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetSummary,
  toggleBudgetStatus
};