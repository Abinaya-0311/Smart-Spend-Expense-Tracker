const { pool } = require('../config/database');

class Category {
  // Create a new category
  static async create(categoryData) {
    const { name, description, color = '#007bff', icon = '📦', userId } = categoryData;
    
    const [result] = await pool.execute(
      `INSERT INTO categories (name, description, color, icon, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, color, icon, userId]
    );
    
    return result.insertId;
  }

  // Get category by ID
  static async findById(categoryId, userId = null) {
    let query = 'SELECT * FROM categories WHERE id = ?';
    let params = [categoryId];

    if (userId) {
      query += ' AND (user_id = ? OR is_default = TRUE)';
      params.push(userId);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // Get all categories for a user (including default categories)
  static async findByUser(userId) {
    const [rows] = await pool.execute(`
      SELECT c.*, 
        CASE WHEN c.user_id = ? THEN TRUE ELSE FALSE END as is_custom,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(CASE WHEN e.type = 'expense' THEN e.amount END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN e.type = 'income' THEN e.amount END), 0) as total_income
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ?
      WHERE c.user_id = ? OR c.is_default = TRUE
      GROUP BY c.id
      ORDER BY c.is_default DESC, c.name ASC
    `, [userId, userId, userId]);
    
    return rows;
  }

  // Get default categories
  static async getDefaults() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE is_default = TRUE ORDER BY name'
    );
    return rows;
  }

  // Update category
  static async update(categoryId, userId, updates) {
    const { name, description, color, icon } = updates;
    
    const [result] = await pool.execute(
      `UPDATE categories 
       SET name = ?, description = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ? AND is_default = FALSE`,
      [name, description, color, icon, categoryId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Delete category (only custom categories can be deleted)
  static async delete(categoryId, userId) {
    // First check if category has any expenses
    const [expenses] = await pool.execute(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ? AND user_id = ?',
      [categoryId, userId]
    );

    if (expenses[0].count > 0) {
      throw new Error('Cannot delete category with existing expenses');
    }

    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = FALSE',
      [categoryId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Get category statistics
  static async getStats(categoryId, userId, startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        c.name,
        c.color,
        c.icon,
        COUNT(CASE WHEN e.type = 'expense' THEN e.id END) as expense_count,
        COUNT(CASE WHEN e.type = 'income' THEN e.id END) as income_count,
        COALESCE(SUM(CASE WHEN e.type = 'expense' THEN e.amount END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN e.type = 'income' THEN e.amount END), 0) as total_income,
        AVG(CASE WHEN e.type = 'expense' THEN e.amount END) as avg_expense,
        AVG(CASE WHEN e.type = 'income' THEN e.amount END) as avg_income
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? 
        AND e.date >= ? AND e.date <= ?
      WHERE c.id = ? AND (c.user_id = ? OR c.is_default = TRUE)
      GROUP BY c.id
    `, [userId, startDate, endDate, categoryId, userId]);
    
    return rows[0];
  }

  // Get category usage over time
  static async getUsageOverTime(categoryId, userId, months = 12) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(e.date, '%Y-%m') as month,
        e.type,
        COUNT(*) as transaction_count,
        SUM(e.amount) as total_amount
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE c.id = ? AND e.user_id = ?
        AND e.date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
        AND (c.user_id = ? OR c.is_default = TRUE)
      GROUP BY DATE_FORMAT(e.date, '%Y-%m'), e.type
      ORDER BY month DESC, e.type
    `, [categoryId, userId, months, userId]);
    
    return rows;
  }

  // Check if user can access category
  static async canAccess(categoryId, userId) {
    const [rows] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND (user_id = ? OR is_default = TRUE)',
      [categoryId, userId]
    );
    return rows.length > 0;
  }

  // Get categories with budget information
  static async findWithBudgets(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        c.*,
        CASE WHEN c.user_id = ? THEN TRUE ELSE FALSE END as is_custom,
        b.id as budget_id,
        b.amount as budget_amount,
        b.period as budget_period,
        b.start_date as budget_start,
        b.end_date as budget_end,
        b.is_active as budget_active,
        COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= COALESCE(b.start_date, DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) 
                         AND e.date <= COALESCE(b.end_date, CURRENT_DATE) THEN e.amount END), 0) as spent_amount
      FROM categories c
      LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ? AND b.is_active = TRUE
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ?
      WHERE c.user_id = ? OR c.is_default = TRUE
      GROUP BY c.id, b.id
      ORDER BY c.is_default DESC, c.name ASC
    `, [userId, userId, userId, userId]);
    
    return rows;
  }
}

module.exports = Category;