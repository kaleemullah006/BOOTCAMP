import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_URL } from "../api/api";
import "./CartCheckout.css";

function formatPrice(price) {
  return `Rs. ${Number(price).toLocaleString("en-PK")}`;
}

function isValidPakistaniPhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(?:\+92|92|0)?3\d{9}$/.test(cleaned);
}

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (!isValidPakistaniPhone(form.phone.trim())) {
      newErrors.phone = "Enter a valid Pakistani mobile number";
    }

    if (!form.city.trim()) {
      newErrors.city = "Please enter your city";
    }

    if (!form.address.trim()) {
      newErrors.address = "Please enter your complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    if (cart.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }

    const orderData = {
      items: cart.map((item) => ({
        productId: item._id,
        qty: item.quantity,
      })),
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
      },
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place your order");
      }

      // Backend response kisi bhi shape mein ho, order nikal lo
      const placedOrder = data.order || data.data || data;

      if (!placedOrder.orderNumber) {
        console.log("ORDER RESPONSE:", data);
        throw new Error("Order placed, but order number was not returned.");
      }

      // Pehle navigate, phir cart clear (warna Empty Cart screen aa jati hai)
      navigate(`/order-success/${placedOrder.orderNumber}`, {
        state: { order: placedOrder },
      });
      clearCart();
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>
          <Link to="/shop" className="checkout-btn">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h1>Checkout</h1>
          <p className="page-subtitle">
            Enter your delivery information.
          </p>

          {serverError && (
            <div className="form-error server-error">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <small className="form-error">{errors.name}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Pakistani Mobile Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="03001234567"
              />
              {errors.phone && (
                <small className="form-error">{errors.phone}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Karachi"
              />
              {errors.city && (
                <small className="form-error">{errors.city}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address">Complete Address *</label>
              <textarea
                id="address"
                name="address"
                rows="4"
                value={form.address}
                onChange={handleChange}
                placeholder="House number, street, area..."
              />
              {errors.address && (
                <small className="form-error">{errors.address}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="note">Order Note (Optional)</label>
              <textarea
                id="note"
                name="note"
                rows="3"
                value={form.note}
                onChange={handleChange}
                placeholder="Any additional instructions..."
              />
            </div>

            <button
              type="submit"
              className="checkout-btn"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        <aside className="checkout-summary">
          <h2>Your Order</h2>

          {cart.map((item) => {
            const price = Number(item.discountPrice ?? item.price);

            return (
              <div className="summary-product" key={item._id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>
                  {formatPrice(price * item.quantity)}
                </strong>
              </div>
            );
          })}

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <p className="delivery-note">
            Payment method: Cash on Delivery (COD)
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;