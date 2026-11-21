import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../utils/adminAuth";
import "./AdminProducts.css";

function formatPrice(price) {
  return `Rs. ${Number(price).toLocaleString("en-PK")}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadProducts() {
    try {
      setError("");
      const data = await adminFetch("/products/admin/all");
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleToggle(product) {
    try {
      setBusyId(product._id);
     await adminFetch(`/products/${product._id}/toggle`, { method: "PATCH" });
      // List mein foran update dikhao
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(product) {
    const sure = window.confirm(`Delete "${product.name}"? Ye wapas nahi aayega.`);
    if (!sure) return;

    try {
      setBusyId(product._id);
      await adminFetch(`/products/${product._id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="ap-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="ap-add-btn">
          + Add Product
        </Link>
      </div>

      {error && <div className="ap-error">{error}</div>}

      {loading ? (
        <p className="adm-page-sub">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="adm-page-sub">Abhi koi product nahi hai.</p>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className={product.isActive ? "" : "ap-row-off"}>
                  <td>
                    {product.images?.[0]?.url ? (
                      <img
                        className="ap-thumb"
                        src={product.images[0].url}
                        alt={product.name}
                      />
                    ) : (
                      <div className="ap-thumb ap-thumb-empty">No image</div>
                    )}
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="ap-small">{product.sizeMl} ml</div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    {product.discountPrice ? (
                      <>
                        <strong>{formatPrice(product.discountPrice)}</strong>
                        <div className="ap-small ap-old">
                          {formatPrice(product.price)}
                        </div>
                      </>
                    ) : (
                      <strong>{formatPrice(product.price)}</strong>
                    )}
                  </td>
                  <td>
                    <span className={product.stock > 0 ? "" : "ap-out"}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`ap-status ${product.isActive ? "ap-on" : "ap-off"}`}
                      onClick={() => handleToggle(product)}
                      disabled={busyId === product._id}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <div className="ap-actions">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="ap-edit"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="ap-delete"
                        onClick={() => handleDelete(product)}
                        disabled={busyId === product._id}
                      >
                        Delete
                      </button>
                    </div>
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