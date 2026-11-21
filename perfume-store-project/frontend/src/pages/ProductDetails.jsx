
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../api/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProduct(id);
        setProduct(data.product || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return <p className="state-message">Loading product...</p>;
  }

  if (error || !product) {
    return (
      <div className="empty-state container">
        <h2>Product Not Found</h2>
        <p>{error || "This product is not available."}</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.url;
  const price = product.discountPrice || product.price;
  const inStock = product.stock > 0;

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="container product-details-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
      </div>

      <div className="product-details-grid">
        <div className="product-gallery">
          <div className="main-product-image">
            {currentImage ? (
              <img src={currentImage} alt={product.name} />
            ) : (
              <div className="image-placeholder">AF PERFUMES</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((image, index) => (
                <button
                  key={image._id || image.path || index}
                  className={`thumbnail ${selectedImage === index ? "selected" : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image.url} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-details-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>

          <div className="detail-price">
            <strong>Rs. {price.toLocaleString()}</strong>
            {product.discountPrice && (
              <del>Rs. {product.price.toLocaleString()}</del>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="detail-meta">
            <p><strong>Size:</strong> {product.sizeMl} ml</p>
            <p>
              <strong>Availability:</strong>{" "}
              <span className={inStock ? "stock-available" : "stock-out"}>
                {inStock ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </p>
          </div>

          <div className="notes-section">
            <h3>Fragrance Notes</h3>
            <p><strong>Top Notes:</strong> {product.notes?.top || "Not specified"}</p>
            <p><strong>Heart Notes:</strong> {product.notes?.heart || "Not specified"}</p>
            <p><strong>Base Notes:</strong> {product.notes?.base || "Not specified"}</p>
          </div>

          <button
            className="btn btn-primary add-cart-btn"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {!inStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
          </button>

          <Link to="/shop" className="back-link">← Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}
