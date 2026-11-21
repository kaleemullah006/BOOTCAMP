
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/api";
import Hero from "../components/Hero";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const list = Array.isArray(data)
          ? data
          : data.products || [];

        setProducts(list.filter((product) => product.isActive !== false));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 4);

  const categories = ["Men", "Women", "Unisex", "Gift Set"];

  return (
    <main>
      
<Hero />
     
    </main>
  );
}

function ProductCard({ product }) {
  const image = product.images?.[0]?.url;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <div className="image-placeholder">AF PERFUMES</div>
        )}
        {product.isFeatured && <span className="product-tag">Featured</span>}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="price-row">
          <strong>Rs. {(product.discountPrice || product.price).toLocaleString()}</strong>
          {product.discountPrice && (
            <del>Rs. {product.price.toLocaleString()}</del>
          )}
        </div>
      </div>
    </Link>
  );
}
