import { useEffect, useMemo, useState } from "react";

import { getBooks, getCategories, countDownload } from "../api";
import "../App.css";
import "./Home.css";

const COVERS = [
  "linear-gradient(135deg,#7c3aed,#3b5bfd)",
  "linear-gradient(135deg,#ec4899,#8b5cf6)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
];

function coverFor(title = "") {
  let sum = 0;
  for (const ch of title) sum += ch.charCodeAt(0);
  return COVERS[sum % COVERS.length];
}

function formatSize(bytes) {
  if (!bytes) return "";

  const mb = bytes / (1024 * 1024);

  return mb >= 1
    ? `${mb.toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

// PWA install button (sirf tab dikhta hai jab browser install allow kare)
function InstallButton() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  return (
    <button
      className="bk-btn bk-btn-ghost"
      onClick={() => {
        promptEvent.prompt();
        setPromptEvent(null);
      }}
    >
      📲 App install karo
    </button>
  );
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Categories load karna
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Books load karna
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      getBooks(search, category)
        .then((data) => {
          setBooks(data);
          setError("");
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  // Sab se zyada download hui kitabein
  const topBooks = useMemo(
    () =>
      [...books]
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 5),
    [books]
  );

  const featured = topBooks[0];

  // Download handle karna
  function handleDownload(book) {
    const name = encodeURIComponent(`${book.title}.pdf`);

    window.location.href = `${book.fileUrl}?download=${name}`;

    countDownload(book._id);

    setBooks((list) =>
      list.map((b) =>
        b._id === book._id
          ? { ...b, downloads: b.downloads + 1 }
          : b
      )
    );
  }

  // WhatsApp par share karna
  function handleShare(book) {
    const text = `📚 ${book.title}${
      book.author ? `\n✍️ ${book.author}` : ""
    }\n\nYeh book yahan se download karo:\n${window.location.origin}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  return (
    <div className="bk-app">
      {/* ---------- Left sidebar ---------- */}
      <aside className="bk-sidebar">
        <div className="bk-logo">
          <span className="bk-logo-icon">📚</span>
          <span>BOOKS</span>
        </div>

        <p className="bk-side-title">Categories</p>

        <nav className="bk-nav">
          <button
            className={`bk-nav-item ${category === "" ? "active" : ""}`}
            onClick={() => setCategory("")}
          >
            🏠 Sab kitabein
          </button>

          {categories.map((c) => (
            <button
              key={c}
              className={`bk-nav-item ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              📖 {c}
            </button>
          ))}
        </nav>

        <div className="bk-side-card">
          <strong>{books.length}</strong>
          <span>kitabein mojood hain</span>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="bk-main">
        <div className="bk-topbar">
          <div className="bk-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Kitab ya musannif ka naam talash karo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <InstallButton />
        </div>

        {/* Featured hero */}
        {featured && !loading && (
          <section className="bk-hero">
            <div
              className="bk-hero-cover"
              style={{ background: coverFor(featured.title) }}
            >
              <span>{(featured.title || "?").charAt(0)}</span>
            </div>

            <div className="bk-hero-info">
              <small className="bk-badge">🔥 Sab se zyada download</small>

              <h2 dir="auto">{featured.title}</h2>

              {featured.author && (
                <p dir="auto">{featured.author}</p>
              )}

              <div className="bk-tags">
                {featured.category && <span>{featured.category}</span>}
                {featured.language && <span>{featured.language}</span>}
                {featured.fileSize > 0 && (
                  <span>{formatSize(featured.fileSize)}</span>
                )}
              </div>

              <div className="bk-actions">
                {featured.fileUrl && (
                  <button
                    className="bk-btn bk-btn-primary"
                    onClick={() => handleDownload(featured)}
                  >
                    ⬇ Download
                  </button>
                )}

                <button
                  className="bk-btn bk-btn-ghost"
                  onClick={() => handleShare(featured)}
                >
                  📤 Share
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="bk-section-title">
          <span>Kitabein</span>
          <small>{books.length} nateeje</small>
        </div>

        {loading && <p className="bk-info">Load ho raha hai...</p>}

        {error && <p className="bk-info bk-error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="bk-info">Koi kitab nahi mili</p>
        )}

        <div className="bk-grid">
          {books.map((book) => (
            <div className="bk-card" key={book._id}>
              <div
                className="bk-cover"
                style={{ background: coverFor(book.title) }}
              >
                <span>{(book.title || "?").charAt(0)}</span>
              </div>

              <h3 dir="auto">{book.title}</h3>

              {book.author && (
                <p className="bk-author" dir="auto">
                  {book.author}
                </p>
              )}

              <div className="bk-tags">
                {book.category && <span>{book.category}</span>}
                {book.language && <span>{book.language}</span>}
                {book.fileSize > 0 && (
                  <span>{formatSize(book.fileSize)}</span>
                )}
              </div>

              <div className="bk-card-bottom">
                <small>⬇ {book.downloads}</small>

                <div className="bk-actions">
                  <button
                    className="bk-btn bk-btn-ghost bk-btn-sm"
                    onClick={() => handleShare(book)}
                  >
                    📤
                  </button>

                  {book.fileUrl ? (
                    <button
                      className="bk-btn bk-btn-primary bk-btn-sm"
                      onClick={() => handleDownload(book)}
                    >
                      Download
                    </button>
                  ) : (
                    <small>File nahi hai</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ---------- Right panel ---------- */}
      <aside className="bk-right">
        <div className="bk-right-head">
          <span className="bk-dot" /> Top Downloads
        </div>

        {topBooks.length === 0 && (
          <p className="bk-info">Abhi kuch nahi</p>
        )}

        {topBooks.map((book, i) => (
          <div className="bk-rank" key={book._id}>
            <span className="bk-rank-no">{i + 1}</span>

            <div className="bk-rank-info">
              <strong dir="auto">{book.title}</strong>
              <small dir="auto">{book.author || book.category}</small>
            </div>

            <span className="bk-rank-count">⬇ {book.downloads}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
