const db = require('../config/db');

class Complaint {
  static async findAll() {
    const [rows] = await db.mysql.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    return rows;
  }

  static async findByUserId(user_id) {
    const [rows] = await db.mysql.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [user_id]);
    return rows;
  }

  static async create({ user_id, subject, message }) {
    const [result] = await db.mysql.query(
      'INSERT INTO `complaints` (`user_id`, `subject`, `message`, `status`) VALUES (?, ?, ?, "pending")',
      [user_id, subject, message]
    );
    return result.insertId;
  }

  static async updateReply(id, reply, replied_by) {
    const [result] = await db.mysql.query(
      'UPDATE `complaints` SET `reply` = ?, `status` = "answered", `replied_by` = ? WHERE `id` = ?',
      [reply, replied_by, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Complaint;
