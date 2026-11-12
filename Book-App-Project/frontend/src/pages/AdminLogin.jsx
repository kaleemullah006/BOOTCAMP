import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { adminLogin } from "../api";
import "../admin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("adminToken")) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await adminLogin(password);
      localStorage.setItem("adminToken", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page adm-center">
      <form className="adm-card adm-login" onSubmit={handleSubmit}>
        <h1 className="adm-title">🔐 Admin Login</h1>
        <p className="adm-sub">Sirf admin ke liye</p>

        <input
          className="adm-input"
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {error && <div className="adm-msg adm-error">{error}</div>}

        <button className="adm-btn adm-primary" disabled={busy || !password}>
          {busy ? "Login ho raha hai..." : "Login"}
        </button>
      </form>
    </div>
  );
}