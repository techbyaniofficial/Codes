import express from "express";
import Redis from "ioredis";
import pkg from "pg";

const { Pool } = pkg;

const app = express();

// Postgres client
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "user",
  password: "pass",
  database: "mydb",
});

// Redis client
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

// -------- API: /product/:id ---------
app.get("/product/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // 🔢 Valid range: 1 to 1,000,000
  if (isNaN(id) || id < 1 || id > 1000000) {
    return res.status(400).send({
      error: "ID must be between 1 and 1,000,000"
    });
  }

  try {
    // 1️⃣ CHECK REDIS CACHE
    const cached = await redis.get(`product:${id}`);
    if (cached) {
      return res.send({
        from: "cache",
        data: JSON.parse(cached),
      });
    }

    // 2️⃣ FETCH FROM DATABASE
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Not found" });
    }

    const product = result.rows[0];

    // 3️⃣ SAVE TO CACHE
    await redis.set(`product:${id}`, JSON.stringify(product), "EX", 600);

    return res.send({
      from: "db",
      data: product,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "server error" });
  }
});

// START SERVER
app.listen(3000, () => {
  console.log("1M Product API → http://localhost:3000/product/500000");
});
