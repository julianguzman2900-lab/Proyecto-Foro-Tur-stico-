const db = require('../config/db');

async function run() {
  try {
    console.log('Running database schema updates...');
    
    // 1. Modify password column to be NULLable
    await db.mysql.query(
      'ALTER TABLE users ALTER COLUMN password DROP NOT NULL'
    );
    console.log('✔ Modified password column to be NULLable.');

    // Helper to check if a column exists
    const columnExists = async (columnName) => {
      const [rows] = await db.mysql.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = $1",
        [columnName]
      );
      return rows.length > 0;
    };

    // 2. Add country column if not exists
    if (!(await columnExists('country'))) {
      await db.mysql.query('ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT NULL');
      console.log('✔ Added country column.');
    } else {
      console.log('• Column country already exists.');
    }

    // 3. Add company_name column if not exists
    if (!(await columnExists('company_name'))) {
      await db.mysql.query('ALTER TABLE users ADD COLUMN company_name VARCHAR(200) DEFAULT NULL');
      console.log('✔ Added company_name column.');
    } else {
      console.log('• Column company_name already exists.');
    }

    // 4. Add google_id column if not exists
    if (!(await columnExists('google_id'))) {
      await db.mysql.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL');
      console.log('✔ Added google_id column.');
    } else {
      console.log('• Column google_id already exists.');
    }

    console.log(' Database schema update complete!');
    process.exit(0);
  } catch (error) {
    console.error(' Database schema update failed:', error);
    process.exit(1);
  }
}

run();
