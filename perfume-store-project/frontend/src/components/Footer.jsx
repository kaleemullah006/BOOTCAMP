
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo footer-logo">
            AF <span>PERFUMES</span>
          </Link>
          <p>
            Discover your signature scent. Luxury fragrances
            crafted for every moment.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
        </div>

        <div>
          <h3>Customer Care</h3>
          <p>Quality fragrances</p>
          <p>Customer support</p>
          <p>Secure ordering</p>
        </div>

        <div>
          <h3>Contact</h3>
          <p>AF Perfumes</p>
          <p>Pakistan</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} AF Perfumes. All rights reserved.
      </div>
    </footer>
  );
}
