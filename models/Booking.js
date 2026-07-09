const db = require('../config/db');

class Booking {
  static async create({ user_id, tour_id, tour_title, date, spots }) {
    const [rows] = await db.mysql.query(
      'INSERT INTO bookings (user_id, tour_id, tour_title, date, spots) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user_id, tour_id, tour_title, date, spots]
    );
    return rows[0] ? rows[0].id : null;
  }

  static async findById(id, user_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return rows[0];
  }

  static async delete(id) {
    await db.mysql.query('DELETE FROM bookings WHERE id = $1', [id]);
  }

  static async findByUserId(user_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY date ASC',
      [user_id]
    );
    return rows;
  }

  static async findCompletedBookings(user_id, tour_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM bookings WHERE user_id = $1 AND tour_id = $2 AND date <= CURRENT_DATE',
      [user_id, tour_id]
    );
    return rows;
  }

  static async findByTourIds(tourIds) {
    if (!tourIds || tourIds.length === 0) return [];
    const placeholders = tourIds.map((_, index) => '$' + (index + 1)).join(',');
    const [rows] = await db.mysql.query(
      `SELECT b.*, u.name as user_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.tour_id IN (${placeholders}) ORDER BY b.created_at DESC`,
      tourIds
    );
    return rows;
  }
}

module.exports = Booking;
