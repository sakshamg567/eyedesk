/*
server's job is to, accept post reqs from watchers,
sanitize and validate the data, and set in sqlite.

For, app-activity watcher, take an app state,
*/

import Database from "better-sqlite3";
import { time } from "console";
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { isUint16Array } from "util/types";

const db = new Database("focus.db");
const app = express();
app.use(express.json());

// Initialize database schema
function initDatabase() {
  try {
    const schema = readFileSync(
      join(__dirname, "../../db/schema.sql"),
      "utf-8",
    );
    db.exec(schema);
    console.log("Database initialized");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
}

initDatabase();

// Validation helpers
function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

function isValidState(state: string): boolean {
  return state === "focused" || state === "unfocused";
}

// App watcher endpoint
app.post("/app-watcher", async (req, res) => {
  try {
    const { next } = req.body;

    // Validate input
    if (!next.app || typeof next.app !== "string") {
      return res.status(400).json({ error: "Invalid app_name" });
    }

    if (next.title !== undefined && typeof next.title !== "string") {
      return res.status(400).json({ error: "Invalid window_title" });
    }

    const now = new Date().toISOString();

    // Get the last active session
    const lastSession = db
      .prepare(
        `
      SELECT * FROM app_sessions
      WHERE end_time IS NULL
      ORDER BY id DESC
      LIMIT 1
    `,
      )
      .get() as
      | {
          id: number;
          app_name: string;
          window_title: string | null;
          start_time: string;
        }
      | undefined;

    // If there's an active session for a different app, close it
    if (lastSession && lastSession.app_name !== next.app) {
      db.prepare(
        `
        UPDATE app_sessions
        SET end_time = ?
        WHERE id = ?
      `,
      ).run(now, lastSession.id);
    }

    // If the app is different from the last session, or no active session exists, start a new one
    if (!lastSession || lastSession.app_name !== next.app) {
      db.prepare(
        `
        INSERT INTO app_sessions (app_name, window_title, start_time)
        VALUES (?, ?, ?)
      `,
      ).run(next.app, next.title || null, now);
    } else {
      // Same app is still active - optionally update window_title if it changed
      if (lastSession.window_title !== next.title && next.title !== undefined) {
        db.prepare(
          `
          UPDATE app_sessions
          SET window_title = ?
          WHERE id = ?
        `,
        ).run(next.title, lastSession.id);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /app-watcher:", err);
    res.status(500).json({ error: "DB operation failed" });
  }
});

// Iris watcher endpoint
app.post("/iris-watcher", async (req, res) => {
  try {
    const { timestamp, duration, state } = req.body;

    // Validate input
    if (!timestamp || !isValidTimestamp(timestamp)) {
      return res.status(400).json({ error: "Invalid timestamp" });
    }

    if (typeof duration !== "number" || duration < 0) {
      return res.status(400).json({ error: "Invalid duration" });
    }

    if (!state || !isValidState(state)) {
      return res
        .status(400)
        .json({ error: 'Invalid state. Must be "focused" or "unfocused"' });
    }

    db.prepare(
      "INSERT INTO iris_focus (timestamp, duration, state) VALUES (?, ?, ?)",
    ).run(timestamp, duration, state);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /iris-watcher:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

app.get("/iris-focus-day", (req, res) => {
  const { date } = req.query;

  const stmt = db.prepare(`
    SELECT *
    FROM iris_focus
    WHERE timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
  `);

  const start = `${date} 00:00:00`;
  const end = `${date} 23:59:59`;

  const data = stmt.all(start, end);
  res.json(data);
});
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  db.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  db.close();
  process.exit(0);
});

app.listen(65000, () => {
  console.log("Server listening on port 65000");
  console.log("Endpoints:");
  console.log("  POST /app-watcher - Log app activity");
  console.log("  POST /iris-watcher - Log eye focus events");
  console.log("  GET  /health - Health check");
});
