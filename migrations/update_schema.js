const db = require('../config/db');

async function run() {
  try {
    console.log('Running database schema updates...');
    
    // 1. Modify password column to be NULLable
    await db.mysql.query(
      'ALTER TABLE `users` MODIFY COLUMN `password` VARCHAR(255) DEFAULT NULL'
    );
    console.log('✔ Modified password column to be NULLable.');

    // 2. Add country column if not exists
    const [cols] = await db.mysql.query('SHOW COLUMNS FROM `users` LIKE "country"');
    if (cols.length === 0) {
      await db.mysql.query('ALTER TABLE `users` ADD COLUMN `country` VARCHAR(100) DEFAULT NULL');
      console.log('✔ Added country column.');
    } else {
      console.log('• Column country already exists.');
    }

    // 3. Add company_name column if not exists
    const [colsCompany] = await db.mysql.query('SHOW COLUMNS FROM `users` LIKE "company_name"');
    if (colsCompany.length === 0) {
      await db.mysql.query('ALTER TABLE `users` ADD COLUMN `company_name` VARCHAR(200) DEFAULT NULL');
      console.log('✔ Added company_name column.');
    } else {
      console.log('• Column company_name already exists.');
    }

    // 4. Add google_id column if not exists
    const [colsGoogle] = await db.mysql.query('SHOW COLUMNS FROM `users` LIKE "google_id"');
    if (colsGoogle.length === 0) {
      await db.mysql.query('ALTER TABLE `users` ADD COLUMN `google_id` VARCHAR(255) DEFAULT NULL');
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
