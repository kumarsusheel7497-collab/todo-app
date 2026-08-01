// ─── State ────────────────────────────────────────────────────
let allTodos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// ─── DOM Elements ─────────────────────────────────────────────
const todoInput  = document.getElementById("todoInput");
const addBtn     = document.getElementById("addBtn");
const todoList   = document.getElementById("todoList");
const statusMsg  = document.getElementById("statusMsg");
const itemCount  = document.getElementById("itemCount");
const clearBtn   = document.getElementById("clearBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

// ─── Save to localStorage ─────────────────────────────────────
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}

// ─── Helpers ──────────────────────────────────────────────────
function showMsg(msg, isError = true) {
  statusMsg.textContent = msg;
  statusMsg.style.color = isError ? "#e53e3e" : "#38a169";
  setTimeout(() => (statusMsg.textContent = ""), 3000);
}

function updateCount() {
  const active = allTodos.filter((t) => !t.completed).length;
  itemCount.textContent = `${active} item${active !== 1 ? "s" : ""} left`;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Render ───────────────────────────────────────────────────
function renderTodos() {
  let filtered = allTodos;
  if (currentFilter === "active")    filtered = allTodos.filter((t) => !t.completed);
  if (currentFilter === "completed") filtered = allTodos.filter((t) =>  t.completed);

  todoList.innerHTML = "";

  if (filtered.length === 0) {
    todoList.innerHTML = `<p class="empty-msg">No todos found 🎉</p>`;
    updateCount();
    return;
  }

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (todo.completed) li.classList.add("completed");

    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} />
      <span>${escapeHTML(todo.title)}</span>
      <input class="edit-input" type="text" value="${escapeHTML(todo.title)}" maxlength="100" />
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
    `;

    // Toggle complete
    li.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    });

    // Edit
    const editBtn = li.querySelector(".edit-btn");
    const titleSpan = li.querySelector("span");
    const editInput = li.querySelector(".edit-input");

    editBtn.addEventListener("click", () => {
      const isEditing = editInput.style.display === "block";
      if (isEditing) {
        const newTitle = editInput.value.trim();
        if (!newTitle) return showMsg("Title cannot be empty!");
        todo.title = newTitle;
        saveTodos();
        renderTodos();
        showMsg("✅ Task updated!", false);
      } else {
        titleSpan.style.display = "none";
        editInput.style.display = "block";
        editInput.focus();
        editBtn.textContent = "💾";
      }
    });

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") editBtn.click();
    });

    // Delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
      if (!confirm("Delete this task?")) return;
      allTodos = allTodos.filter((t) => t.id !== todo.id);
      saveTodos();
      renderTodos();
      showMsg("🗑️ Task deleted!", false);
    });

    todoList.appendChild(li);
  });

  updateCount();
}

// ─── Add Todo ─────────────────────────────────────────────────
function addTodo() {
  const title = todoInput.value.trim();
  if (!title) return showMsg("Please enter a task!");

  const newTodo = {
    id: Date.now(),
    title: title,
    completed: false,
  };

  allTodos.unshift(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = "";
  showMsg("✅ Task added!", false);
}

// ─── Clear Completed ──────────────────────────────────────────
function clearCompleted() {
  const completed = allTodos.filter((t) => t.completed);
  if (completed.length === 0) return showMsg("No completed tasks to clear!");
  if (!confirm(`Delete ${completed.length} completed task(s)?`)) return;

  allTodos = allTodos.filter((t) => !t.completed);
  saveTodos();
  renderTodos();
  showMsg("✅ Cleared completed tasks!", false);
}

// ─── Event Listeners ──────────────────────────────────────────
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

clearBtn.addEventListener("click", clearCompleted);

// ─── Init ─────────────────────────────────────────────────────
renderTodos();