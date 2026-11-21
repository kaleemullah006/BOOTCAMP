import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { buildOrderMessage, getWhatsAppLink } from "../utils/whatsapp";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // 1) navigate state se order lo, 2) warna refresh ke liye sessionStorage se
    if (location.state?.order) {
      setOrder(location.state.order);
      sessionStorage.setItem("lastOrder", JSON.stringify(location.state.order));
      return;
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem("lastOrder"));
      if (saved && saved.orderNumber === orderNumber) setOrder(saved);
    } catch {
      /* ignore */
    }
  }, [location.state, orderNumber]);

  const whatsappLink = order
    ? getWhatsAppLink(buildOrderMessage(order))
    : getWhatsAppLink(`Assalam o Alaikum! My order number is ${orderNumber}.`);

  return (
    <div className="container success-page">
      <div className="success-icon">✓</div>
      <h1>Thank you for your order!</h1>
      <p className="success-sub">
        Your order <strong>{orderNumber}</strong> has been placed. Payment will be
        collected in cash on delivery.
      </p>

      {order && (
        <div className="card success-summary">
          <h3>Order Summary</h3>
          {order.items.map((item, i) => (
            <div className="success-row" key={i}>
              <span>
                {item.name} x {item.qty}
              </span>
              <span>PKR {(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="success-row success-total">
            <span>Total</span>
            <span>PKR {Number(order.total).toLocaleString()}</span>
          </div>
          <p className="success-address">
            Deliver to: {order.customer.name}, {order.customer.address},{" "}
            {order.customer.city}
          </p>
        </div>
      )}

      <div className="success-actions">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Send order on WhatsApp
        </a>
        <Link to="/shop" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}