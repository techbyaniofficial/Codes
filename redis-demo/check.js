import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  user: "user",
  password: "pass",
  database: "mydb",
  port: 5432,
});

async function check() {
  const count = await pool.query("SELECT COUNT(*) FROM products");
  console.log("Total products:", count.rows[0].count);

  const few = await pool.query("SELECT * FROM products LIMIT 5");
  console.log("Sample rows:", few.rows);

  process.exit(0);
}

check();
