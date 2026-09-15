require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: Variable de entorno DATABASE_URL no configurada.');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('[Setup Editions] Connected to PostgreSQL on Supabase.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS event_editions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        banner_url TEXT,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Setup Editions] ✅ Table "event_editions" ensured.');

  } catch (err) {
    console.error('[Setup Editions] ❌ Error setting up editions tables:', err);
  } finally {
    await client.end();
  }
}

run();
