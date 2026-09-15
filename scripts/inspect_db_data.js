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

    console.log('--- PURCHAED TICKETS ---');
    const purRes = await client.query("SELECT order_id, ticket_id, ticket_name, ticket_price, total_accesos, status, created_at, edition_slug FROM purchased_tickets ORDER BY created_at DESC LIMIT 10");
    console.table(purRes.rows);

    console.log('--- ORDERS ---');
    const ordRes = await client.query("SELECT order_id, ticket_id, payment_method, status, quantity, created_at FROM orders ORDER BY created_at DESC LIMIT 10");
    console.table(ordRes.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
