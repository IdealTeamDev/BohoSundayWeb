const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres.hctdykhdekhwvmhrdrnv:DzmrE1fW55srqlEp@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();

    console.log('=== 1. PURCHASED_TICKETS ===');
    const purRes = await client.query('SELECT order_id, ticket_id, ticket_name, ticket_price, total_accesos, status, edition_slug FROM purchased_tickets');
    console.log(`Total rows in purchased_tickets: ${purRes.rowCount}`);
    let sumPurPrice = 0;
    let sumTotalAccesosPrice = 0;
    purRes.rows.forEach(r => {
      const price = Number(r.ticket_price) || 0;
      const accesos = Number(r.total_accesos) || 1;
      sumPurPrice += price;
      sumTotalAccesosPrice += price * accesos;
      console.log(`- Order: ${r.order_id} | Ticket: ${r.ticket_id} (${r.ticket_name}) | Price: $${price} | Accesos: ${accesos} | Edition: ${r.edition_slug} | Status: ${r.status}`);
    });
    console.log(`Sum of ticket_price: $${sumPurPrice}`);
    console.log(`Sum of ticket_price * total_accesos: $${sumTotalAccesosPrice}`);

    console.log('\n=== 2. BOLETERIA_MESAS (Camas/Mesas) ===');
    const mesasRes = await client.query('SELECT id, name, zone, number, price, available FROM boleteria_mesas ORDER BY zone, number');
    console.log(`Total mesas in boleteria_mesas: ${mesasRes.rowCount}`);
    mesasRes.rows.forEach(m => {
      if (!m.available || m.id.includes('oasis')) {
        console.log(`- Mesa ID: ${m.id} | Name: ${m.name} | Price: $${m.price} | Available: ${m.available}`);
      }
    });

    console.log('\n=== 3. BOLETERIA_INDIVIDUAL ===');
    const indRes = await client.query('SELECT id, name, price, stock FROM boleteria_individual');
    indRes.rows.forEach(i => {
      console.log(`- Ticket ID: ${i.id} | Name: ${i.name} | Price: $${i.price} | Stock: ${i.stock}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
