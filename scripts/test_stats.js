const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres.hctdykhdekhwvmhrdrnv:DzmrE1fW55srqlEp@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();

    const purRes = await client.query("SELECT order_id, ticket_id, ticket_name, ticket_price, total_accesos, status, edition_slug FROM purchased_tickets WHERE status IN ('paid', 'used')");
    
    const colombiamodaRows = purRes.rows.filter(r => (r.edition_slug || 'colombiamoda') === 'colombiamoda');
    const entreSolesRows = purRes.rows.filter(r => r.edition_slug === 'entre-soles');

    let colTotalRevenue = 0;
    let colTotalSold = 0;
    colombiamodaRows.forEach(r => {
      colTotalRevenue += Number(r.ticket_price) || 0;
      colTotalSold += 1;
    });

    console.log(`Colombiamoda: Revenue = $${colTotalRevenue.toLocaleString('es-CO')} COP | Sold = ${colTotalSold} tickets | Rows = ${colombiamodaRows.length}`);
    console.log(`Entre Soles: Revenue = $${entreSolesRows.length} | Sold = ${entreSolesRows.length} tickets`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
