import express from "express";
import { query } from "../db.js";

const router = express.Router();


// GET /api/tasks
// Get all tasks
router.get("/", async (req, res, next) => {
    try {
        const result = await query(`
      SELECT
        id,
        title,
        completed,
        created_at
      FROM tasks
      ORDER BY id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});


// POST /api/tasks
// Create a new task
router.post("/", async (req, res, next) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        const result = await query(
            `
      INSERT INTO tasks (title)
      VALUES ($1)
      RETURNING
        id,
        title,
        completed,
        created_at
      `,
            [title.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});


// PUT /api/tasks/:id
// Update a task
router.put("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const { title, completed } = req.body;

        if (title === undefined && completed === undefined) {
            return res.status(400).json({
                error: "Nothing to update"
            });
        }

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                error: "Title cannot be empty"
            });
        }

        const result = await query(
            `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed)
      WHERE id = $3
      RETURNING
        id,
        title,
        completed,
        created_at
      `,
            [
                title !== undefined ? title.trim() : null,
                completed !== undefined ? completed : null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});


// DELETE /api/tasks/:id
// Delete a task
router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = await query(
            `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING id
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});


export default router;