const db = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.mysql.query('SELECT * FROM `users` WHERE `email` = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.mysql.query('SELECT * FROM `users` WHERE `id` = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, email, password, role, status, country = null, company_name = null, google_id = null }) {
    const [result] = await db.mysql.query(
      'INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`, `country`, `company_name`, `google_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, role, status, country, company_name, google_id]
    );
    return result.insertId;
  }

  static async findByGoogleId(google_id) {
    const [rows] = await db.mysql.query('SELECT * FROM `users` WHERE `google_id` = ?', [google_id]);
    return rows[0] || null;
  }

  static async updateGoogleId(id, google_id) {
    const [result] = await db.mysql.query(
      'UPDATE `users` SET `google_id` = ? WHERE `id` = ?',
      [google_id, id]
    );
    return result.affectedRows > 0;
  }

  static async findAllSellers() {
    const [rows] = await db.mysql.query("SELECT * FROM `users` WHERE `role` = 'seller' ORDER BY `created_at` DESC");
    return rows;
  }

  static async updateStatus(id, status, reason = null) {
    const [result] = await db.mysql.query(
      'UPDATE `users` SET `status` = ?, `rejection_reason` = ? WHERE `id` = ?',
      [status, reason, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
