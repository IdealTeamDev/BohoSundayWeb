const { Client } = require('pg');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const connectionString = 'postgres://postgres.hctdykhdekhwvmhrdrnv:DzmrE1fW55srqlEp@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table staff_users ensured.');
    
    const res = await client.query('SELECT * FROM staff_users WHERE username = $1', ['admin']);
    if (res.rowCount === 0) {
      await client.query(`INSERT INTO staff_users (name, username, pin_hash, role, is_active) VALUES ($1, $2, $3, $4, $5)`, ['Admin', 'admin', hashPassword('password'), 'admin', true]);
      console.log('Admin user created.');
    }
    
    const res2 = await client.query('SELECT * FROM staff_users WHERE username = $1', ['portero1']);
    if (res2.rowCount === 0) {
      await client.query(`INSERT INTO staff_users (name, username, pin_hash, role, is_active) VALUES ($1, $2, $3, $4, $5)`, ['Portero 1', 'portero1', hashPassword('portero'), 'bouncer', true]);
      console.log('Portero 1 user created.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
