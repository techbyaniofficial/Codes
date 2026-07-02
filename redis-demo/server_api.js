import express from "express";
import fetch from "node-fetch";
import { createClient } from "redis";

const app = express();
const PORT = 3000;

// Redis client
const redis = createClient({ url: "redis://localhost:6379" });
redis.on("error", err => console.error("Redis Error:", err));

await redis.connect(); // connect once at the start

// -----------------------------
// API Endpoint
// -----------------------------
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `post:${id}`;

  try {
    // 1️⃣ Check Redis Cache
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json({
        source: "redis",
        data: JSON.parse(cachedData)
      });
    }

    // 2️⃣ Fetch From External API
    console.log("Calling external API...");
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const data = await response.json();

    // 3️⃣ Save to Redis With TTL of 600 sec
    await redis.set(cacheKey, JSON.stringify(data), { EX: 600 });

    // 4️⃣ Return Result
    return res.json({
      source: "external api",
      data
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
