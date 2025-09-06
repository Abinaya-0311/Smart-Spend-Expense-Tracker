const { pool } = require('../config/database');

class Expense {
  // Create a new expense
  static async create(expenseData) {
    const { title, amount, categoryId, type = 'expense', description, date, userId } = expenseData;
    
    const [result] = await pool.execute(
      `INSERT INTO expenses (title, amount, category_id, type, description, date, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, amount, categoryId, type, description, date, userId]
    );
    
    return result.insertId;
  }

  // Get expense by ID
  static async findById(expenseId, userId) {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? AND e.user_id = ?
    `, [expenseId, userId]);
    
    return rows[0];
  }

  // Get all expenses for a user with filters
  static async findByUser(userId, filters = {}) {
    let query = `
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `;
    let params = [userId];

    // Add filters
    if (filters.type) {
      query += ' AND e.type = ?';
      params.push(filters.type);
    }

    if (filters.categoryId) {
      query += ' AND e.category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.startDate) {
      query += ' AND e.date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND e.date <= ?';
      params.push(filters.endDate);
    }

    if (filters.minAmount) {
      query += ' AND e.amount >= ?';
      params.push(filters.minAmount);
    }

    if (filters.maxAmount) {
      query += ' AND e.amount <= ?';
      params.push(filters.maxAmount);
    }

    if (filters.search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Add sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY e.${sortBy} ${sortOrder}`;

    // Add pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Update expense
  static async update(expenseId, userId, updates) {
    const { title, amount, categoryId, type, description, date } = updates;
    
    const [result] = await pool.execute(
      `UPDATE expenses 
       SET title = ?, amount = ?, category_id = ?, type = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, amount, categoryId, type, description, date, expenseId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Delete expense
  static async delete(expenseId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Get expense summary by category
  static async getSummaryByCategory(userId, startDate, endDate, type = null) {
    let query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        COUNT(e.id) as transaction_count,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? 
        AND e.date >= ? AND e.date <= ?
    `;
    let params = [userId, startDate, endDate];

    if (type) {
      query += ' AND e.type = ?';
      params.push(type);
    }

    query += `
      WHERE (c.user_id = ? OR c.is_default = TRUE)
      GROUP BY c.id, c.name, c.color, c.icon
      HAVING transaction_count > 0 OR c.is_default = TRUE
      ORDER BY total_amount DESC
    `;
    params.push(userId);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get monthly expense trends
  static async getMonthlyTrends(userId, months = 12) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM expenses
      WHERE user_id = ? 
        AND date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m'), type
      ORDER BY month DESC, type
    `, [userId, months]);
    
    return rows;
  }

  // Get recent expenses
  static async getRecent(userId, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.created_at DESC
      LIMIT ?
    `, [userId, limit]);
    
    return rows;
  }

  // Get total count for pagination
  static async getCount(userId, filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM expenses WHERE user_id = ?';
    let params = [userId];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.categoryId) {
      query += ' AND category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Expense;