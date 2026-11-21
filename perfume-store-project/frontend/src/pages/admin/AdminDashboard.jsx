import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../utils/adminAuth";
import { formatPrice, formatDate } from "./AdminOrders";
import "./AdminOrders.css";
import "./AdminDashboard.css";

const LOW_STOCK = 5;

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [orderData, productData] = await Promise.all([
          adminFetch("/orders/admin/all"),
          adminFetch("/products/admin/all"),
        ]);
        setOrders(Array.isArray(orderData) ? orderData : orderData.orders || []);
        setProducts(
          Array.isArray(productData) ? productData : productData.products || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="adm-page-sub">Loading dashboard...</p>;

  const pending = orders.filter((o) => o.status === "Pending").length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const lowStock = products
    .filter((p) => p.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const recent = orders.slice(0, 5);

  const cards = [
    { label: "Total Orders", value: orders.length, to: "/admin/orders" },
    { label: "Pending Orders", value: pending, to: "/admin/orders", alert: pending > 0 },
    {
      label: "Active Products",
      value: `${activeProducts} / ${products.length}`,
      to: "/admin/products",
    },
    { label: "Delivered Revenue", value: formatPrice(revenue), to: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="adm-page-title">Dashboard</h1>
      <p className="adm-page-sub">AF Perfumes ka ek nazar mein hisaab.</p>

      {error && <div className="ao-error">{error}</div>}

      <div className="db-cards">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`db-card ${card.alert ? "db-card-alert" : ""}`}
          >
            <span className="db-card-label">{card.label}</span>
            <strong className="db-card-value">{card.value}</strong>
          </Link>
        ))}
      </div>

      <div className="db-grid">
        {/* Recent orders */}
        <section className="db-panel">
          <div className="db-panel-head">
            <h3>Latest Orders</h3>
            <Link to="/admin/orders">View all</Link>
          </div>

          {recent.length === 0 ? (
            <p className="ao-small">Abhi koi order nahi aaya.</p>
          ) : (
            recent.map((order) => (
              <Link
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="db-row"
              >
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div className="ao-small">
                    {order.customer?.name} · {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="db-row-end">
                  <strong>{formatPrice(order.total)}</strong>
                  <span className={`ao-badge ao-${order.status}`}>{order.status}</span>
                </div>
              </Link>
            ))
          )}
        </section>

        {/* Low stock */}
        <section className="db-panel">
          <div className="db-panel-head">
            <h3>Low Stock</h3>
            <Link to="/admin/products">Manage</Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="ao-small">Sab products ka stock theek hai.</p>
          ) : (
            lowStock.map((product) => (
              <Link
                key={product._id}
                to={`/admin/products/${product._id}/edit`}
                className="db-row"
              >
                <div>
                  <strong>{product.name}</strong>
                  <div className="ao-small">{product.sizeMl} ml</div>
                </div>
                <span
                  className={`db-stock ${product.stock === 0 ? "db-stock-out" : ""}`}
                >
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </span>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}