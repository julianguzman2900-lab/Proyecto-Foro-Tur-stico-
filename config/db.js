const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de MySQL
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'foro_turistico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión MySQL
async function testMySQL() {
  try {
    const connection = await mysqlPool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
  }
}
testMySQL();

// Configuración de MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foro_turistico')
  .then(() => console.log('✅ Conectado a la base de datos MongoDB.'))
  .catch(error => console.error('❌ Error al conectar a MongoDB:', error.message));

module.exports = {
  mysql: mysqlPool,
  mongoose
};
