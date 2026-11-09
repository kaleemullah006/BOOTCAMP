import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API);
      setNotes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await axios.post(API, { title, content });
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchNotes();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="app">
      <header className="header">
        <h1>📝 Notes App</h1>
        <p>Apne khayalat aur kaam ek jagah likho</p>
      </header>

      <form className="card form" onSubmit={addNote}>
        <input
          className="input"
          placeholder="Note ka title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input textarea"
          placeholder="Note likho..."
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          + Add Note
        </button>
      </form>

      <div className="list-header">
        <h2>Aap ke Notes</h2>
        <span className="badge">{notes.length}</span>
      </div>

      {loading ? (
        <p className="message">Loading...</p>
      ) : notes.length === 0 ? (
        <div className="card empty">
          <p>Abhi koi note nahi hai.</p>
          <span>Upar se apna pehla note banao 👆</span>
        </div>
      ) : (
        <div className="notes">
          {notes.map((note) => (
            <div className="card note" key={note._id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-footer">
                <span className="date">{formatDate(note.createdAt)}</span>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteNote(note._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;