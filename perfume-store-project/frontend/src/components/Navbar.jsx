import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER;

function Navbar() {
  const { cart } = useCart();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  // Scroll par sirf look badlega (layout nahi), is liye flicker nahi hoga
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Page badle to mobile menu band
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menu khula ho to page scroll band, Escape se band
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `nb-link ${isActive ? "nb-link-active" : ""}`;

  return (
    <>
      {/* Announcement bar: normal flow, scroll ke saath khud nikal jati hai */}
      

      <header className={`nb-header ${scrolled ? "nb-scrolled" : ""}`}>
        <div className="nb-bar">
          <div className="nb-inner">
            {/* Logo */}
            <Link to="/" className="nb-logo" aria-label="AF Perfumes home">
              {logoFailed ? (
                <span className="nb-logo-text">AF Perfumes</span>
              ) : (
                <img
                  src="/logo.png"
                  alt="AF Perfumes"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </Link>

            {/* Desktop links */}
            <nav className="nb-links" aria-label="Main navigation">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/shop" className={linkClass}>
                Shop
              </NavLink>
              {WHATSAPP && (
                <a
                  className="nb-link"
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              )}
            </nav>

            {/* Right side: cart + hamburger */}
            <div className="nb-actions">
              <Link
                to="/cart"
                className="nb-cart"
                aria-label={`Cart, ${count} items`}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 7h12l-1 12H7L6 7z" />
                  <path d="M9 7V6a3 3 0 0 1 6 0v1" />
                </svg>
                {count > 0 && (
                  <span className="nb-badge" key={count}>
                    {count}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className={`nb-burger ${open ? "nb-burger-open" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`nb-overlay ${open ? "nb-overlay-show" : ""}`}
          onClick={() => setOpen(false)}
        />
        <aside className={`nb-drawer ${open ? "nb-drawer-open" : ""}`}>
          <nav className="nb-drawer-links">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={linkClass}>
              Shop
            </NavLink>
            <NavLink to="/cart" className={linkClass}>
              Cart {count > 0 && <span className="nb-drawer-count">{count}</span>}
            </NavLink>
            {WHATSAPP && (
              <a
                className="nb-link"
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact on WhatsApp
              </a>
            )}
          </nav>
          <p className="nb-drawer-note">
            Luxury fragrances, delivered to your door.
          </p>
        </aside>
      </header>
    </>
  );
}

export default Navbar;