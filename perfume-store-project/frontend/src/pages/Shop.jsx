
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProducts } from "../api/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("default");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

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

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(
        (product) => product.category === category
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, sort]);

  return (
    <main className="container shop-page">
      <div className="page-heading">
        <p className="eyebrow">EXPLORE OUR COLLECTION</p>
        <h1>Shop All Perfumes</h1>
        <p>Find the fragrance that defines you.</p>
      </div>

      <div className="shop-toolbar">
        <input
          type="search"
          placeholder="Search perfumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search perfumes"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Unisex">Unisex</option>
          <option value="Gift Set">Gift Set</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
        >
          <option value="default">Default Sorting</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {loading ? (
        <p className="state-message">Loading products...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h2>No Products Found</h2>
          <p>Try changing your search or category.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearch("");
              setCategory("");
              setSort("default");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="results-count">
            {filteredProducts.length} products found
          </p>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <Link
                to={`/product/${product._id}`}
                className="product-card"
                key={product._id}
              >
                <div className="product-image">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                    />
                  ) : (
                    <div className="image-placeholder">AF PERFUMES</div>
                  )}
                </div>

                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="price-row">
                    <strong>
                      Rs. {(product.discountPrice || product.price).toLocaleString()}
                    </strong>
                    {product.discountPrice && (
                      <del>Rs. {product.price.toLocaleString()}</del>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
