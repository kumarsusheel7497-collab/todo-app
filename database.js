const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "todos.db");
const db = new Database(DB_PATH);

console.log("Connected to SQLite database");

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

console.log("Todos table ready");

module.exports = db;