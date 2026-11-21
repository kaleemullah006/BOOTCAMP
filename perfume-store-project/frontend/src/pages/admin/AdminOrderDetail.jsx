import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminFetch } from "../../utils/adminAuth";
import { STATUSES, formatPrice, formatDate } from "./AdminOrders";
import "./AdminOrders.css";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setOrder(await adminFetch(`/orders/admin/${id}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function changeStatus(status) {
    if (status === order.status) return;

    if (
      status === "Cancelled" &&
      !window.confirm(
        "Is order ko Cancel karna hai? Stock wapas ho jayega aur order dobara change nahi hoga."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const updated = await adminFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
      setMessage(`Status updated: ${updated.status}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="adm-page-sub">Loading order...</p>;
  if (!order) return <div className="ao-error">{error || "Order not found"}</div>;

  const isCancelled = order.status === "Cancelled";

  return (
    <div className="od-wrap">
      <Link to="/admin/orders" className="od-back">← Back to orders</Link>

      <div className="od-head">
        <div>
          <h1 className="adm-page-title">{order.orderNumber}</h1>
          <p className="adm-page-sub">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`ao-badge ao-${order.status}`}>{order.status}</span>
      </div>

      {error && <div className="ao-error">{error}</div>}
      {message && <div className="od-success">{message}</div>}

      <section className="od-card">
        <h3>Change Status</h3>
        {isCancelled ? (
          <p className="ao-small">
            Ye order Cancel ho chuka hai, ab iska status change nahi ho sakta.
          </p>
        ) : (
          <div className="od-status-row">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`od-status-btn ${order.status === s ? "od-status-current" : ""}`}
                onClick={() => changeStatus(s)}
                disabled={saving}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="od-card">
        <h3>Customer</h3>
        <p><strong>{order.customer?.name}</strong></p>
        <p>Phone: <a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a></p>
        <p>City: {order.customer?.city}</p>
        <p>Address: {order.customer?.address}</p>
        {order.customer?.note && <p>Note: {order.customer.note}</p>}
      </section>

      <section className="od-card">
        <h3>Items</h3>
        {order.items?.map((item, i) => (
          <div className="od-item" key={i}>
            {item.image && <img src={item.image} alt="" className="od-thumb" />}
            <div className="od-item-info">
              <strong>{item.name}</strong>
              <span className="ao-small">
                {formatPrice(item.price)} x {item.qty}
              </span>
            </div>
            <strong>{formatPrice(item.price * item.qty)}</strong>
          </div>
        ))}
        <div className="od-total">
          <span>Total ({order.paymentMethod || "COD"})</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </section>
    </div>
  );
}