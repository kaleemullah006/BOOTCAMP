import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { API_URL } from "../../api/api";
import { setToken, isLoggedIn } from "../../utils/adminAuth";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Pehle se logged in ho to seedha dashboard
  if (isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  // Mouse ke hisaab se card ko 3D tilt dena (re-render ke baghair)
  function handleMouseMove(event) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

    card.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--gx", "50%");
    card.style.setProperty("--gy", "50%");
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter the admin password");
      triggerShake();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="al-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background depth */}
      <div className="al-orb al-orb-1" />
      <div className="al-orb al-orb-2" />
      <div className="al-orb al-orb-3" />
      <div className="al-grid" />

      <div className="al-stage">
        <form
          ref={cardRef}
          className={`al-card ${shake ? "al-shake" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="al-glare" />

          <div className="al-badge al-layer-3">AF</div>

          <h1 className="al-title al-layer-2">Welcome Back</h1>
          <p className="al-subtitle al-layer-1">AF Perfumes Admin Panel</p>

          {error && <div className="al-error al-layer-1">{error}</div>}

          <div className="al-field al-layer-2">
            <input
              type={showPassword ? "text" : "password"}
              className="al-input"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              className="al-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="al-submit al-layer-3"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="al-footer al-layer-1">Authorized access only</p>
        </form>
      </div>
    </main>
  );
}