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
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [user_id]);
    return rows;
  }

  static async findBySellerId(seller_id) {
    const [rows] = await db.mysql.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.seller_id = $1
      ORDER BY c.created_at DESC
    `, [seller_id]);
    return rows;
  }

  static async create({ user_id, subject, message, tour_id, tour_title, seller_id }) {
    const [rows] = await db.mysql.query(
      "INSERT INTO complaints (user_id, subject, message, status, tour_id, tour_title, seller_id) VALUES ($1, $2, $3, 'pending', $4, $5, $6) RETURNING id",
      [user_id, subject, message, tour_id || null, tour_title || null, seller_id || null]
    );
    return rows[0] ? rows[0].id : null;
  }

  static async updateReply(id, reply, replied_by) {
    const [, result] = await db.mysql.query(
      "UPDATE complaints SET reply = $1, status = 'answered', replied_by = $2 WHERE id = $3",
      [reply, replied_by, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Complaint;
