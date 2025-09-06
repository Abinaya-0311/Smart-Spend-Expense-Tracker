const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, verification_token) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, null]
    );
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, first_name, last_name, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user verification status
  static async verifyUser(userId) {
    const [result] = await pool.execute(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Update user password
  static async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Set password reset token
  static async setResetToken(email, resetToken, expiresAt) {
    const [result] = await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [resetToken, expiresAt, email]
    );
    return result.affectedRows > 0;
  }

  // Find user by reset token
  static async findByResetToken(resetToken) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [resetToken]
    );
    return rows[0];
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    const { firstName, lastName } = updates;
    const [result] = await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, userId]
    );
    return result.affectedRows > 0;
  }

  // Delete user account
  static async deleteAccount(userId) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Get user statistics
  static async getStats(userId) {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT e.id) as total_expenses,
        COUNT(DISTINCT CASE WHEN e.type = 'expense' THEN e.id END) as total_expense_count,
        COUNT(DISTINCT CASE WHEN e.type = 'income' THEN e.id END) as total_income_count,
        COALESCE(SUM(CASE WHEN e.type = 'expense' THEN e.amount END), 0) as total_spent,
        COALESCE(SUM(CASE WHEN e.type = 'income' THEN e.amount END), 0) as total_income,
        COUNT(DISTINCT b.id) as active_budgets,
        COUNT(DISTINCT c.id) as categories_used
      FROM users u
      LEFT JOIN expenses e ON u.id = e.user_id
      LEFT JOIN budgets b ON u.id = b.user_id AND b.is_active = TRUE
      LEFT JOIN categories c ON u.id = c.user_id OR c.is_default = TRUE
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);
    
    return stats[0] || {
      total_expenses: 0,
      total_expense_count: 0,
      total_income_count: 0,
      total_spent: 0,
      total_income: 0,
      active_budgets: 0,
      categories_used: 0
    };
  }
}

module.exports = User;