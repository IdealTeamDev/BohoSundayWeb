const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres.hctdykhdekhwvmhrdrnv:DzmrE1fW55srqlEp@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('[Setup Editions] Connected to PostgreSQL on Supabase.');

    // 1. Create table event_editions
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_editions (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT false,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Setup Editions] ✅ Table "event_editions" ensured.');

    // 2. Insert default editions if not present
    await client.query(`
      INSERT INTO event_editions (id, slug, name, is_active)
      VALUES 
        ('colombiamoda', 'colombiamoda', 'Colombiamoda', false),
        ('entre-soles', 'entre-soles', 'Entre Soles', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('[Setup Editions] ✅ Default editions ("Colombiamoda", "Entre Soles") ensured.');

    // Ensure only one edition is active if multiple are marked active
    await client.query(`
      UPDATE event_editions SET is_active = false WHERE slug = 'colombiamoda';
      UPDATE event_editions SET is_active = true WHERE slug = 'entre-soles';
    `);

    // 3. Add edition_slug and edition_name to orders
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS edition_slug VARCHAR(100) DEFAULT 'colombiamoda',
      ADD COLUMN IF NOT EXISTS edition_name VARCHAR(255) DEFAULT 'Colombiamoda';
    `);
    console.log('[Setup Editions] ✅ Columns added to "orders" table.');

    // 4. Add edition_slug and edition_name to purchased_tickets
    await client.query(`
      ALTER TABLE purchased_tickets 
      ADD COLUMN IF NOT EXISTS edition_slug VARCHAR(100) DEFAULT 'colombiamoda',
      ADD COLUMN IF NOT EXISTS edition_name VARCHAR(255) DEFAULT 'Colombiamoda';
    `);
    console.log('[Setup Editions] ✅ Columns added to "purchased_tickets" table.');

    // 5. Update existing historical rows where edition_slug is NULL
    const ordersUpdate = await client.query(`
      UPDATE orders 
      SET edition_slug = 'colombiamoda', edition_name = 'Colombiamoda'
      WHERE edition_slug IS NULL OR edition_slug = '';
    `);
    console.log(`[Setup Editions] ✅ Updated ${ordersUpdate.rowCount} historical rows in "orders" to "colombiamoda".`);

    const ticketsUpdate = await client.query(`
      UPDATE purchased_tickets 
      SET edition_slug = 'colombiamoda', edition_name = 'Colombiamoda'
      WHERE edition_slug IS NULL OR edition_slug = '';
    `);
    console.log(`[Setup Editions] ✅ Updated ${ticketsUpdate.rowCount} historical rows in "purchased_tickets" to "colombiamoda".`);

    // 6. Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_edition_slug ON orders(edition_slug);
      CREATE INDEX IF NOT EXISTS idx_purchased_tickets_edition_slug ON purchased_tickets(edition_slug);
    `);
    console.log('[Setup Editions] ✅ Indexes created for edition_slug.');

    console.log('[Setup Editions] 🎉 Migration completed successfully!');
  } catch (err) {
    console.error('[Setup Editions] ❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
