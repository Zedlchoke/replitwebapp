
#!/usr/bin/env node

/**
 * PRODUCTION DATABASE MIGRATION SCRIPT FOR RENDER
 * Tự động tạo tables và thêm missing columns
 */

const { Pool } = require('pg');

async function migrateProductionDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Starting Render database migration...');
    
    // Tạo tables nếu chưa tồn tại
    console.log('📊 Creating tables if not exist...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        tax_id VARCHAR(20) NOT NULL UNIQUE,
        address TEXT,
        phone VARCHAR(20),
        email TEXT,
        website TEXT,
        industry TEXT,
        contact_person TEXT,
        account TEXT,
        password TEXT,
        bank_account TEXT,
        bank_name TEXT,
        custom_fields JSONB DEFAULT '{}',
        notes TEXT,
        establishment_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Businesses table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_transactions (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        document_number TEXT,
        handled_by TEXT NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Document transactions table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Admin users table ready');

    // Thêm admin user mặc định
    await pool.query(`
      INSERT INTO admin_users (username, password) 
      VALUES ('quanadmin', '01020811')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('✅ Admin user created');

    // Thêm missing columns nếu cần
    try {
      await pool.query(`
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS establishment_date TEXT;
      `);
      console.log('✅ Added establishment_date column');
    } catch (err) {
      console.log('ℹ️ establishment_date already exists');
    }

    try {
      await pool.query(`
        ALTER TABLE document_transactions 
        ADD COLUMN IF NOT EXISTS document_number TEXT;
      `);
      console.log('✅ Added document_number column');
    } catch (err) {
      console.log('ℹ️ document_number already exists');
    }

    // Kiểm tra kết quả
    const businessCount = await pool.query('SELECT COUNT(*) FROM businesses');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM document_transactions');
    const adminCount = await pool.query('SELECT COUNT(*) FROM admin_users');

    console.log(`📊 Database ready:`);
    console.log(`   - Businesses: ${businessCount.rows[0].count}`);
    console.log(`   - Transactions: ${transactionCount.rows[0].count}`);
    console.log(`   - Admins: ${adminCount.rows[0].count}`);
    
    console.log('🎉 Render database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
if (require.main === module) {
  migrateProductionDatabase();
}

module.exports = { migrateProductionDatabase };
