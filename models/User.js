const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.mysql.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ name, email, password, role, status }) {
    const [result] = await db.mysql.query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, status]
    );
    return result.insertId;
  }

  static async findAllSellers() {
    const [rows] = await db.mysql.query("SELECT * FROM users WHERE role = 'seller' ORDER BY created_at DESC");
    return rows;
  }

  static async updateStatus(id, status, reason = null) {
    const [result] = await db.mysql.query(
      'UPDATE users SET status = ?, rejection_reason = ? WHERE id = ?',
      [status, reason, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
