import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, deleteBook } from "../api";
import UploadForm from "../components/UploadForm";
import "../admin.css";

const formatSize = (bytes) =>
  bytes ? (bytes / (1024 * 1024)).toFixed(1) + " MB" : "-";

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      setBooks(await getBooks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (book) => {
    if (!window.confirm(`"${book.title}" hamesha ke liye delete karni hai?`)) return;
    try {
      await deleteBook(book._id);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const totalSize = books.reduce((sum, b) => sum + (b.fileSize || 0), 0);
  const totalDownloads = books.reduce((sum, b) => sum + (b.downloads || 0), 0);

  return (
    <div className="adm-page">
      <div className="adm-wrap">
        <div className="adm-topbar">
          <h1 className="adm-title">📚 Admin Dashboard</h1>
          <button className="adm-btn adm-ghost" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="adm-stats">
          <div className="adm-card adm-stat">
            <strong>{books.length}</strong>
            <span>Books</span>
          </div>
          <div className="adm-card adm-stat">
            <strong>{formatSize(totalSize)}</strong>
            <span>Storage (1 GB mein se)</span>
          </div>
          <div className="adm-card adm-stat">
            <strong>{totalDownloads}</strong>
            <span>Downloads</span>
          </div>
        </div>

        <UploadForm onUploaded={fetchBooks} />

        <h2 className="adm-section">Uploaded Books</h2>

        {loading ? (
          <p className="adm-sub">Loading...</p>
        ) : books.length === 0 ? (
          <div className="adm-card adm-empty">Abhi koi book upload nahi hui.</div>
        ) : (
          <div className="adm-list">
            {books.map((book) => (
              <div className="adm-card adm-book" key={book._id}>
                <div className="adm-book-info">
                  <h3>{book.title}</h3>
                  <p>
                    {book.author || "Author maloom nahi"} · {book.category} ·{" "}
                    {book.language}
                  </p>
                  <small>
                    {formatSize(book.fileSize)} · {book.downloads} downloads ·{" "}
                    {new Date(book.createdAt).toLocaleDateString("en-GB")}
                  </small>
                </div>
                <div className="adm-actions">
                  {book.fileUrl && (
                    <a
                      className="adm-btn adm-ghost"
                      href={book.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  )}
                  <button
                    className="adm-btn adm-danger"
                    onClick={() => handleDelete(book)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}