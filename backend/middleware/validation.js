const validator = require('validator');

// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for expense creation/update
const validateExpense = (req, res, next) => {
  const { title, amount, categoryId, type, date } = req.body;
  const errors = [];

  if (!title || title.trim().length < 1) {
    errors.push('Title is required');
  }

  if (!amount || !validator.isFloat(amount.toString(), { min: 0.01 })) {
    errors.push('Amount must be a positive number');
  }

  if (!categoryId || !validator.isInt(categoryId.toString(), { min: 1 })) {
    errors.push('Valid category ID is required');
  }

  if (type && !['expense', 'income'].includes(type)) {
    errors.push('Type must be either "expense" or "income"');
  }

  if (!date || !validator.isDate(date)) {
    errors.push('Valid date is required (YYYY-MM-DD format)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for budget creation/update
const validateBudget = (req, res, next) => {
  const { categoryId, amount, period, startDate, endDate } = req.body;
  const errors = [];

  if (!categoryId || !validator.isInt(categoryId.toString(), { min: 1 })) {
    errors.push('Valid category ID is required');
  }

  if (!amount || !validator.isFloat(amount.toString(), { min: 0.01 })) {
    errors.push('Amount must be a positive number');
  }

  if (period && !['monthly', 'yearly'].includes(period)) {
    errors.push('Period must be either "monthly" or "yearly"');
  }

  if (!startDate || !validator.isDate(startDate)) {
    errors.push('Valid start date is required (YYYY-MM-DD format)');
  }

  if (!endDate || !validator.isDate(endDate)) {
    errors.push('Valid end date is required (YYYY-MM-DD format)');
  }

  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push('End date must be after start date');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for category creation/update
const validateCategory = (req, res, next) => {
  const { name, color } = req.body;
  const errors = [];

  if (!name || name.trim().length < 1) {
    errors.push('Category name is required');
  }

  if (color && !validator.isHexColor(color)) {
    errors.push('Color must be a valid hex color code');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateExpense,
  validateBudget,
  validateCategory
};