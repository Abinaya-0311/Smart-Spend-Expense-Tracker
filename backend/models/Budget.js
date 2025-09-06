const { pool } = require('../config/database');

class Budget {
  // Create a new budget
  static async create(budgetData) {
    const { categoryId, userId, amount, period = 'monthly', startDate, endDate } = budgetData;
    
    const [result] = await pool.execute(
      `INSERT INTO budgets (category_id, user_id, amount, period, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [categoryId, userId, amount, period, startDate, endDate]
    );
    
    return result.insertId;
  }

  // Get budget by ID
  static async findById(budgetId, userId) {
    const [rows] = await pool.execute(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.user_id = ?
    `, [budgetId, userId]);
    
    return rows[0];
  }

  // Get all budgets for a user
  static async findByUser(userId, filters = {}) {
    let query = `
      SELECT 
        b.*,
        c.name as category_name, 
        c.color as category_color, 
        c.icon as category_icon,
        COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                     THEN e.amount END), 0) as spent_amount,
        (b.amount - COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                                 THEN e.amount END), 0)) as remaining_amount,
        CASE 
          WHEN b.amount > 0 THEN 
            (COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                          THEN e.amount END), 0) / b.amount) * 100
          ELSE 0 
        END as usage_percentage
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN expenses e ON b.category_id = e.category_id AND e.user_id = b.user_id
      WHERE b.user_id = ?
    `;
    let params = [userId];

    // Add filters
    if (filters.isActive !== undefined) {
      query += ' AND b.is_active = ?';
      params.push(filters.isActive);
    }

    if (filters.period) {
      query += ' AND b.period = ?';
      params.push(filters.period);
    }

    if (filters.categoryId) {
      query += ' AND b.category_id = ?';
      params.push(filters.categoryId);
    }

    query += ' GROUP BY b.id ORDER BY b.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Update budget
  static async update(budgetId, userId, updates) {
    const { amount, period, startDate, endDate, isActive } = updates;
    
    const [result] = await pool.execute(
      `UPDATE budgets 
       SET amount = ?, period = ?, start_date = ?, end_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [amount, period, startDate, endDate, isActive, budgetId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Delete budget
  static async delete(budgetId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [budgetId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Get budget with spending details
  static async getWithSpending(budgetId, userId) {
    const [rows] = await pool.execute(`
      SELECT 
        b.*,
        c.name as category_name, 
        c.color as category_color, 
        c.icon as category_icon,
        COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                     THEN e.amount END), 0) as spent_amount,
        (b.amount - COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                                 THEN e.amount END), 0)) as remaining_amount,
        CASE 
          WHEN b.amount > 0 THEN 
            (COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                          THEN e.amount END), 0) / b.amount) * 100
          ELSE 0 
        END as usage_percentage,
        COUNT(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
              THEN e.id END) as transaction_count
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN expenses e ON b.category_id = e.category_id AND e.user_id = b.user_id
      WHERE b.id = ? AND b.user_id = ?
      GROUP BY b.id
    `, [budgetId, userId]);
    
    return rows[0];
  }

  // Get budget alerts (budgets exceeding threshold)
  static async getAlerts(userId, threshold = 80) {
    const [rows] = await pool.execute(`
      SELECT 
        b.*,
        c.name as category_name, 
        c.color as category_color, 
        c.icon as category_icon,
        COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                     THEN e.amount END), 0) as spent_amount,
        CASE 
          WHEN b.amount > 0 THEN 
            (COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                          THEN e.amount END), 0) / b.amount) * 100
          ELSE 0 
        END as usage_percentage
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN expenses e ON b.category_id = e.category_id AND e.user_id = b.user_id
      WHERE b.user_id = ? AND b.is_active = TRUE
        AND b.start_date <= CURRENT_DATE AND b.end_date >= CURRENT_DATE
      GROUP BY b.id
      HAVING usage_percentage >= ?
      ORDER BY usage_percentage DESC
    `, [userId, threshold]);
    
    return rows;
  }

  // Get budget summary
  static async getSummary(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_budgets,
        COUNT(CASE WHEN b.is_active = TRUE THEN 1 END) as active_budgets,
        SUM(b.amount) as total_budget_amount,
        SUM(COALESCE(spent.amount, 0)) as total_spent,
        AVG(CASE WHEN b.amount > 0 THEN (COALESCE(spent.amount, 0) / b.amount) * 100 ELSE 0 END) as avg_usage_percentage
      FROM budgets b
      LEFT JOIN (
        SELECT 
          b2.id,
          SUM(CASE WHEN e.type = 'expense' AND e.date >= b2.start_date AND e.date <= b2.end_date 
              THEN e.amount ELSE 0 END) as amount
        FROM budgets b2
        LEFT JOIN expenses e ON b2.category_id = e.category_id AND e.user_id = b2.user_id
        WHERE b2.user_id = ?
        GROUP BY b2.id
      ) spent ON b.id = spent.id
      WHERE b.user_id = ?
    `, [userId, userId]);
    
    return rows[0];
  }

  // Check if budget exists for category and period
  static async existsForCategoryAndPeriod(categoryId, userId, period, startDate) {
    const [rows] = await pool.execute(
      'SELECT id FROM budgets WHERE category_id = ? AND user_id = ? AND period = ? AND start_date = ?',
      [categoryId, userId, period, startDate]
    );
    return rows.length > 0;
  }

  // Get current month budgets
  static async getCurrentMonth(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        b.*,
        c.name as category_name, 
        c.color as category_color, 
        c.icon as category_icon,
        COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                     THEN e.amount END), 0) as spent_amount,
        (b.amount - COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                                 THEN e.amount END), 0)) as remaining_amount,
        CASE 
          WHEN b.amount > 0 THEN 
            (COALESCE(SUM(CASE WHEN e.type = 'expense' AND e.date >= b.start_date AND e.date <= b.end_date 
                          THEN e.amount END), 0) / b.amount) * 100
          ELSE 0 
        END as usage_percentage
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN expenses e ON b.category_id = e.category_id AND e.user_id = b.user_id
      WHERE b.user_id = ? AND b.is_active = TRUE
        AND b.start_date <= CURRENT_DATE AND b.end_date >= CURRENT_DATE
      GROUP BY b.id
      ORDER BY usage_percentage DESC
    `, [userId]);
    
    return rows;
  }
}

module.exports = Budget;