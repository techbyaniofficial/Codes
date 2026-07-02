import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "user",
  password: "pass",
  database: "mydb",
});

async function seed() {
  console.time("Seeding time");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      price INT
    );
  `);

  const result = await pool.query("SELECT COUNT(*) FROM products");
  const existing = parseInt(result.rows[0].count);

  if (existing >= 1000000) {
    console.log("1M rows already exist.");
    process.exit(0);
  }

  console.log("Inserting 1,000,000 rows…");

  const BATCH = 10000; // 10k rows per batch
  const TOTAL = 1000000;

  for (let start = existing + 1; start <= TOTAL; start += BATCH) {
    const items = [];

    for (let i = start; i < start + BATCH && i <= TOTAL; i++) {
      items.push(`('Product ${i}', ${Math.floor(Math.random() * 1000)})`);
    }

    const sql = `
      INSERT INTO products (name, price)
      VALUES ${items.join(",")}
    `;

    await pool.query(sql);

    console.log(`Inserted: ${Math.min(start + BATCH - 1, TOTAL)} / ${TOTAL}`);
  }

  console.timeEnd("Seeding time");
  process.exit(0);
}

seed();
