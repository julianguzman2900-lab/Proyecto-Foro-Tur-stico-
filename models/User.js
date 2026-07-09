const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.mysql.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.mysql.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async create({ name, email, password, role, status, country = null, company_name = null, google_id = null }) {
    const [rows] = await db.mysql.query(
      'INSERT INTO users (name, email, password, role, status, country, company_name, google_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, email, password, role, status, country, company_name, google_id]
    );
    return rows[0] ? rows[0].id : null;
  }

  static async findByGoogleId(google_id) {
    const [rows] = await db.mysql.query('SELECT * FROM users WHERE google_id = $1', [google_id]);
    return rows[0] || null;
  }

  static async updateGoogleId(id, google_id) {
    const [, result] = await db.mysql.query(
      'UPDATE users SET google_id = $1 WHERE id = $2',
      [google_id, id]
    );
    return result.affectedRows > 0;
  }

  static async findAllSellers() {
    const [rows] = await db.mysql.query("SELECT * FROM users WHERE role = 'seller' ORDER BY created_at DESC");
    return rows;
  }

  static async updateStatus(id, status, reason = null) {
    const [, result] = await db.mysql.query(
      'UPDATE users SET status = $1, rejection_reason = $2 WHERE id = $3',
      [status, reason, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
