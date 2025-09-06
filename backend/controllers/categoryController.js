const Category = require('../models/Category');

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color = '#007bff', icon = '📦' } = req.body;

    const categoryId = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      color,
      icon,
      userId: req.user.id
    });

    const category = await Category.findById(categoryId, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    next(error);
  }
};

// Get all categories for user
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findByUser(req.user.id);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get categories with budget information
const getCategoriesWithBudgets = async (req, res, next) => {
  try {
    const categories = await Category.findWithBudgets(req.user.id);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(parseInt(id), req.user.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await Category.findById(parseInt(id), req.user.id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if it's a default category
    if (existingCategory.is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify default categories'
      });
    }

    const updated = await Category.update(parseInt(id), req.user.id, {
      name: name.trim(),
      description: description?.trim(),
      color,
      icon
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update category'
      });
    }

    const category = await Category.findById(parseInt(id), req.user.id);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    next(error);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const existingCategory = await Category.findById(parseInt(id), req.user.id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if it's a default category
    if (existingCategory.is_default) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default categories'
      });
    }

    const deleted = await Category.delete(parseInt(id), req.user.id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing expenses'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Cannot delete category with existing expenses') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// Get category statistics
const getCategoryStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const stats = await Category.getStats(parseInt(id), req.user.id, start, end);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...stats,
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

// Get category usage over time
const getCategoryUsage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { months = 12 } = req.query;

    const usage = await Category.getUsageOverTime(parseInt(id), req.user.id, parseInt(months));

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    next(error);
  }
};

// Get default categories
const getDefaultCategories = async (req, res, next) => {
  try {
    const categories = await Category.getDefaults();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoriesWithBudgets,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryUsage,
  getDefaultCategories
};