import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { removeToken } from "../../utils/adminAuth";
import "./AdminLayout.css";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    removeToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="adm-shell">
      {/* Mobile top bar */}
      <header className="adm-topbar">
        <button
          type="button"
          className="adm-menu-btn"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <span className="adm-topbar-title">AF Admin</span>
      </header>

      <aside className={`adm-sidebar ${open ? "adm-sidebar-open" : ""}`}>
        <div className="adm-brand">
          <span className="adm-brand-badge">AF</span>
          <span className="adm-brand-name">Perfumes Admin</span>
        </div>

        <nav className="adm-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `adm-link ${isActive ? "adm-link-active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">
            View Store
          </a>
          <button type="button" className="adm-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="adm-content">
        <Outlet />
      </main>
    </div>
  );
}