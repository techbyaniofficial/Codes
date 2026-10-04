import express from "express";

import tasksRouter from "./routes/tasks.js";

import {
  testDatabaseConnection,
  initializeDatabase
} from "./db.js";


const app = express();

const PORT = Number(process.env.PORT || 8080);


// Parse JSON request bodies
app.use(express.json());


// Health endpoint
app.get("/health", async (req, res) => {
  try {
    await testDatabaseConnection();

    res.json({
      status: "ok",
      database: "connected"
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});


// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "TaskFlow API",
    status: "running"
  });
});


// Task APIs
app.use("/api/tasks", tasksRouter);


// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: "Internal server error"
  });
});


// Start server
async function startServer() {
  try {
    console.log("Connecting to PostgreSQL...");

    await testDatabaseConnection();

    console.log("PostgreSQL connected");

    await initializeDatabase();

    console.log("Database initialized");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TaskFlow API running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start application:", error);

    process.exit(1);
  }
}


startServer();