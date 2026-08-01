const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Todo API is running...");
});

app.get("/todos", (req, res) => {
  try {
    const todos = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/todos", (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const result = db.prepare("INSERT INTO todos (title) VALUES (?)").run(title.trim());
    res.status(201).json({
      id: result.lastInsertRowid,
      title: title.trim(),
      completed: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    const newTitle = title !== undefined ? title.trim() : todo.title;
    const newCompleted = completed !== undefined ? completed : todo.completed;
    db.prepare("UPDATE todos SET title = ?, completed = ? WHERE id = ?").run(newTitle, newCompleted, id);
    res.json({ id: Number(id), title: newTitle, completed: newCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});