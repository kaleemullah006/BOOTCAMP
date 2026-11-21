import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../utils/adminAuth";
import "./AdminOrders.css";

export const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export function formatPrice(price) {
  return `Rs. ${Number(price).toLocaleString("en-PK")}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await adminFetch("/orders/admin/all");
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visible =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="adm-page-title">Orders</h1>
      <p className="adm-page-sub">{orders.length} total orders</p>

      <div className="ao-filters">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={`ao-filter ${filter === s ? "ao-filter-active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== "All" && (
              <span className="ao-count">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="ao-error">{error}</div>}

      {loading ? (
        <p className="adm-page-sub">Loading orders...</p>
      ) : visible.length === 0 ? (
        <p className="adm-page-sub">Koi order nahi mila.</p>
      ) : (
        <div className="ao-table-wrap">
          <table className="ao-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>City</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order._id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>
                    {order.customer?.name}
                    <div className="ao-small">{order.customer?.phone}</div>
                  </td>
                  <td>{order.customer?.city}</td>
                  <td><strong>{formatPrice(order.total)}</strong></td>
                  <td className="ao-small">{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={`ao-badge ao-${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order._id}`} className="ao-view">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}