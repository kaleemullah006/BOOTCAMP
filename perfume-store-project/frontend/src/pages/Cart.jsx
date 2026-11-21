
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartCheckout.css";

function formatPrice(price) {
  return `Rs. ${Number(price).toLocaleString("en-PK")}`;
}

function Cart() {
  const {
    cart,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>
          <p>Looks like you haven't added any perfumes yet.</p>
          <Link to="/shop" className="checkout-btn">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        <p className="page-subtitle">
          You have {cart.length} product(s) in your cart.
        </p>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => {
              const price = Number(item.discountPrice ?? item.price);

              return (
                <div className="cart-item" key={item._id}>
                  <img
                    src={item.images?.[0]?.url || ""}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>{formatPrice(price)}</p>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (Number(item.stock) || 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong>
                      {formatPrice(price * item.quantity)}
                    </strong>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>Calculated later</strong>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <p className="delivery-note">
              Delivery charges, if any, will be confirmed by our team.
            </p>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>

            <Link to="/shop" className="continue-shopping">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
