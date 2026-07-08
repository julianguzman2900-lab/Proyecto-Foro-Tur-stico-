const db = require('../config/db');

class Booking {
  static async create({ user_id, tour_id, tour_title, date, spots }) {
    const [result] = await db.mysql.query(
      'INSERT INTO bookings (user_id, tour_id, tour_title, date, spots) VALUES (?, ?, ?, ?, ?)',
      [user_id, tour_id, tour_title, date, spots]
    );
    return result.insertId;
  }

  static async findByUserId(user_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY date ASC',
      [user_id]
    );
    return rows;
  }
}

module.exports = Booking;
