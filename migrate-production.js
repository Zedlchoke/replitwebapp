#!/usr/bin/env node

/**
 * PRODUCTION DATABASE MIGRATION SCRIPT
 * Adds missing columns to Render PostgreSQL database
 * 
 * Missing columns identified:
 * - establishment_date already exists ✅
 * - document_number already exists ✅ 
 * 
 * This script will sync the complete schema to production
 */

const { Pool } = require('pg');

async function migrateProductionDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Starting production database migration...');
    
    // Check current schema state
    console.log('📊 Checking businesses table schema...');
    const businessesColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businesses'
    `);
    
    console.log('📊 Checking document_transactions table schema...');
    const transactionsColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'document_transactions'
    `);
    
    const businessColNames = businessesColumns.rows.map(r => r.column_name);
    const transactionColNames = transactionsColumns.rows.map(r => r.column_name);
    
    console.log('Current businesses columns:', businessColNames.length);
    console.log('Current transaction columns:', transactionColNames.length);
    
    // Add missing establishment_date if not exists
    if (!businessColNames.includes('establishment_date')) {
      console.log('➕ Adding establishment_date to businesses table...');
      await pool.query(`
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS establishment_date TEXT
      `);
    } else {
      console.log('✅ establishment_date already exists in businesses table');
    }
    
    // Add missing document_number if not exists  
    if (!transactionColNames.includes('document_number')) {
      console.log('➕ Adding document_number to document_transactions table...');
      await pool.query(`
        ALTER TABLE document_transactions 
        ADD COLUMN IF NOT EXISTS document_number TEXT
      `);
    } else {
      console.log('✅ document_number already exists in document_transactions table');
    }
    
    // Verify final schema
    console.log('🔍 Verifying final schema...');
    const finalBusinesses = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businesses'
      ORDER BY ordinal_position
    `);
    
    const finalTransactions = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'document_transactions' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Businesses table columns:', finalBusinesses.rows.length);
    console.log('✅ Document transactions columns:', finalTransactions.rows.length);
    
    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    const testBusiness = await pool.query('SELECT COUNT(*) FROM businesses');
    const testTransactions = await pool.query('SELECT COUNT(*) FROM document_transactions');
    
    console.log(`📊 Current businesses count: ${testBusiness.rows[0].count}`);
    console.log(`📊 Current transactions count: ${testTransactions.rows[0].count}`);
    
    console.log('🎉 Production database migration completed successfully!');
    
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