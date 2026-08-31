const { Client } = require('pg');

const connectionString = 'postgres://postgres.hctdykhdekhwvmhrdrnv:DzmrE1fW55srqlEp@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    await client.connect();
    console.log('[Setup DB] Connected to PostgreSQL on Supabase.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(255) PRIMARY KEY,
        ticket_id VARCHAR(255) NOT NULL,
        session_token VARCHAR(255),
        buyer_info JSONB NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_id VARCHAR(255),
        error_detail TEXT,
        accesses_used INTEGER DEFAULT 0,
        stage_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Setup DB] ✅ Table "orders" ensured in Supabase.');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `);
    console.log('[Setup DB] ✅ Indexes for "orders" table created.');

  } catch (err) {
    console.error('[Setup DB] ❌ Error setting up orders table:', err);
  } finally {
    await client.end();
  }
}

run();
