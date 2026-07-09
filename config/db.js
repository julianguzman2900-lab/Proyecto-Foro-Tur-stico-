const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// ===============================
// CONFIGURACIÓN POSTGRESQL / SUPABASE
// ===============================

const dbPassword = process.env.DB_PASSWORD || '';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://postgres:${dbPassword}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pgPool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Adaptador para compatibilidad con consultas antiguas
const queryWrapper = {
  query: async (text, params) => {
    const res = await pgPool.query(text, params);

    const resultMock = {
      insertId:
        res.rows && res.rows[0] && res.rows[0].id
          ? res.rows[0].id
          : null,
      affectedRows: res.rowCount,
      rowCount: res.rowCount
    };

    return [res.rows, resultMock];
  },

  getConnection: async () => {
    const client = await pgPool.connect();

    return {
      query: async (text, params) => {
        const res = await client.query(text, params);

        const resultMock = {
          insertId:
            res.rows && res.rows[0] && res.rows[0].id
              ? res.rows[0].id
              : null,
          affectedRows: res.rowCount,
          rowCount: res.rowCount
        };

        return [res.rows, resultMock];
      },

      release: () => client.release()
    };
  }
};


// ===============================
// PROBAR POSTGRESQL
// ===============================

async function testPostgreSQL() {
  try {
    const client = await pgPool.connect();

    console.log('✅ Conectado a la base de datos PostgreSQL/Supabase.');

    // Ejecutar migración automática de la tabla complaints
    await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS tour_id VARCHAR(50);');
    await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS tour_title VARCHAR(200);');
    await client.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS seller_id INT;');
    console.log('✅ Migración de tabla complaints completada.');

    client.release();

  } catch (error) {
    console.error(
      '❌ Error al conectar a PostgreSQL/Supabase:',
      error.message
    );
  }
}

testPostgreSQL();


// ===============================
// CONFIGURACIÓN MONGODB ATLAS
// ===============================

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    '❌ No existe MONGODB_URI en el archivo .env'
  );
} else {

  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas.');
  })
  .catch((error) => {
    console.error(
      '❌ Error al conectar a MongoDB:',
      error.message
    );
  });

}


// ===============================
// EXPORTACIONES
// ===============================

module.exports = {
  mysql: queryWrapper,
  pgPool,
  mongoose
};