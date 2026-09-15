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

    const purRes = await client.query("SELECT order_id, ticket_id, ticket_name, ticket_price, total_accesos, status, edition_slug FROM purchased_tickets WHERE status IN ('paid', 'used')");
    console.log('Purchased count:', purRes.rows.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
