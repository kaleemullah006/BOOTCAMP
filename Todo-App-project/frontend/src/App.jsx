import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API);
      setTodos(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await axios.post(API, { title });
    setTitle("");
    fetchTodos();
  };

  const toggleTodo = async (todo) => {
    await axios.patch(`${API}/${todo._id}`, { completed: !todo.completed });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTodos();
  };

  // ---- Naya hissa: Edit ----
  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    await axios.patch(`${API}/${id}`, { title: editTitle });
    cancelEdit();
    fetchTodos();
  };

  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="header">
        <h1>✅ Todo App</h1>
        <p>
          {todos.length === 0
            ? "Aaj ka pehla kaam likho"
            : `${doneCount} / ${todos.length} kaam mukammal`}
        </p>
      </header>

      <form className="card form" onSubmit={addTodo}>
        <input
          className="input"
          placeholder="Naya kaam likho..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          + Add
        </button>
      </form>

      {loading ? (
        <p className="message">Loading...</p>
      ) : todos.length === 0 ? (
        <div className="card empty">
          <p>Abhi koi kaam nahi hai.</p>
          <span>Upar se pehla kaam add karo 👆</span>
        </div>
      ) : (
        <div className="todos">
          {todos.map((todo) => (
            <div
              className={`card todo ${todo.completed ? "done" : ""}`}
              key={todo._id}
            >
              <button
                className={`check ${todo.completed ? "checked" : ""}`}
                onClick={() => toggleTodo(todo)}
              >
                {todo.completed ? "✓" : ""}
              </button>

              {editingId === todo._id ? (
                <>
                  <input
                    className="input edit-input"
                    value={editTitle}
                    autoFocus
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo._id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <div className="actions">
                    <button
                      className="btn btn-save"
                      onClick={() => saveEdit(todo._id)}
                    >
                      Save
                    </button>
                    <button className="btn btn-cancel" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="todo-title">{todo.title}</span>
                  <div className="actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => startEdit(todo)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;