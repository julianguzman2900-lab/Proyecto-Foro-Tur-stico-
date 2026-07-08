const db = require('../config/db');

class Booking {
  static async create({ user_id, tour_id, tour_title, date, spots }) {
    const [result] = await db.mysql.query(
      'INSERT INTO `bookings` (`user_id`, `tour_id`, `tour_title`, `date`, `spots`) VALUES (?, ?, ?, ?, ?)',
      [user_id, tour_id, tour_title, date, spots]
    );
    return result.insertId;
  }

  static async findByUserId(user_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM `bookings` WHERE `user_id` = ? ORDER BY `date` ASC',
      [user_id]
    );
    return rows;
  }

  static async findCompletedBookings(user_id, tour_id) {
    const [rows] = await db.mysql.query(
      'SELECT * FROM `bookings` WHERE `user_id` = ? AND `tour_id` = ? AND `date` <= CURDATE()',
      [user_id, tour_id]
    );
    return rows;
  }

  static async findByTourIds(tourIds) {
    if (!tourIds || tourIds.length === 0) return [];
    const placeholders = tourIds.map(() => '?').join(',');
    const [rows] = await db.mysql.query(
      `SELECT b.*, u.name as user_name FROM \`bookings\` b JOIN \`users\` u ON b.user_id = u.id WHERE b.tour_id IN (${placeholders}) ORDER BY b.created_at DESC`,
      tourIds
    );
    return rows;
  }
}

module.exports = Booking;
