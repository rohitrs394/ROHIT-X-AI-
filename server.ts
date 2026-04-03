import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize SQLite
const db = new Database("chat_history.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    session_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", server: "Rohit X AI Backend" });
});

// History endpoints
app.get("/api/history/:user_id", (req, res) => {
  const { user_id } = req.params;
  try {
    const history = db.prepare("SELECT role, content, timestamp FROM messages WHERE user_id = ? ORDER BY timestamp ASC").all(user_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.delete("/api/history/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { session_id } = req.query;
  try {
    if (session_id) {
      db.prepare("DELETE FROM messages WHERE user_id = ? AND session_id = ?").run(user_id, session_id);
    } else {
      db.prepare("DELETE FROM messages WHERE user_id = ?").run(user_id);
    }
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear history" });
  }
});

// Save message endpoint (called from frontend after Gemini response)
app.post("/api/history/save", (req, res) => {
  const { user_id, session_id, role, content } = req.body;
  try {
    const insert = db.prepare("INSERT INTO messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)");
    insert.run(user_id, session_id, role, content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Stats endpoint (Frontend will report stats here)
let latestStats: any = [];
app.post("/api/stats/report", (req, res) => {
  latestStats = req.body.stats;
  res.json({ success: true });
});

app.get("/api/stats", (req, res) => {
  res.json({
    active_keys: latestStats.filter((s: any) => s.status === "Active").length,
    cooldown_keys: latestStats.filter((s: any) => s.status === "Cooldown").length,
    details: latestStats
  });
});

// Vite integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rohit X AI server running on http://localhost:${PORT}`);
  });
}

setupVite();
