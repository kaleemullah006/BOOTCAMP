import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminFetch } from "../../utils/adminAuth";
import { supabase, BUCKET } from "../../utils/supabase";
import "./AdminProductForm.css";

const CATEGORIES = ["Men", "Women", "Unisex", "Gift Set"];
const MAX_IMAGES = 5;
const MAX_SIZE = 2 * 1024 * 1024;
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "Men",
  sizeMl: "",
  stock: "",
  top: "",
  heart: "",
  base: "",
  isFeatured: false,
  isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // { key, url, path?, file? }
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Edit mode: product load karo
  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      try {
        const p = await adminFetch(`/products/admin/${id}`);
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price ?? "",
          discountPrice: p.discountPrice ?? "",
          category: p.category || "Men",
          sizeMl: p.sizeMl ?? "",
          stock: p.stock ?? "",
          top: p.notes?.top || "",
          heart: p.notes?.heart || "",
          base: p.notes?.base || "",
          isFeatured: Boolean(p.isFeatured),
          isActive: p.isActive !== false,
        });
        setImages(
          (p.images || []).map((img) => ({
            key: img.path,
            path: img.path,
            url: img.url,
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleFiles(event) {
    setError("");
    const files = Array.from(event.target.files);
    event.target.value = "";

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const added = [];
    for (const file of files) {
      if (!EXT[file.type]) {
        setError("Only JPG, PNG and WEBP images are allowed");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is bigger than 2 MB`);
        return;
      }
      added.push({
        key: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      });
    }
    setImages((prev) => [...prev, ...added]);
  }

  function removeImage(key) {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }

  function makeMain(key) {
    setImages((prev) => {
      const target = prev.find((img) => img.key === key);
      return [target, ...prev.filter((img) => img.key !== key)];
    });
  }

  // 1) backend se signed token, 2) browser se seedha Supabase upload
  async function uploadOne(file) {
    const meta = await adminFetch("/products/upload-url", {
      method: "POST",
      body: JSON.stringify({
        filename: `image${EXT[file.type]}`,
        contentType: file.type,
        size: file.size,
      }),
    });

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .uploadToSignedUrl(meta.path, meta.token, file, {
        contentType: file.type,
      });

    if (uploadError) throw new Error(uploadError.message);
    return meta.path;
  }

  function validate() {
    if (!form.name.trim()) return "Please enter the product name";
    if (!form.description.trim()) return "Please enter a description";
    if (!form.price || Number(form.price) <= 0) return "Please enter a valid price";
    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) >= Number(form.price)
    ) {
      return "Discount price must be less than price";
    }
    if (!form.sizeMl || Number(form.sizeMl) <= 0) return "Please enter size in ml";
    if (form.stock === "" || Number(form.stock) < 0) return "Please enter stock";
    if (images.length === 0) return "Please add at least one image";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    try {
      setSaving(true);

      // Naye files upload karo, purani ki path wahi rehne do (order maintain)
      const paths = [];
      for (const img of images) {
        paths.push(img.file ? await uploadOne(img.file) : img.path);
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discountPrice: form.discountPrice === "" ? "" : Number(form.discountPrice),
        category: form.category,
        sizeMl: Number(form.sizeMl),
        stock: Number(form.stock),
        notes: {
          top: form.top.trim(),
          heart: form.heart.trim(),
          base: form.base.trim(),
        },
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        images: paths,
      };

      await adminFetch(isEdit ? `/products/${id}` : "/products", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="adm-page-sub">Loading product...</p>;

  return (
    <div className="pf-wrap">
      <Link to="/admin/products" className="pf-back">
        ← Back to products
      </Link>
      <h1 className="adm-page-title">{isEdit ? "Edit Product" : "Add Product"}</h1>
      <p className="adm-page-sub">Product ki tamam details yahan bharein.</p>

      {error && <div className="pf-error">{error}</div>}

      <form className="pf-form" onSubmit={handleSubmit} noValidate>
        {/* Basic */}
        <section className="pf-card">
          <h3>Basic Info</h3>

          <label className="pf-label">Product Name *</label>
          <input className="pf-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Royal Oud" />

          <label className="pf-label">Description *</label>
          <textarea className="pf-input" name="description" rows="4" value={form.description} onChange={handleChange} placeholder="Perfume ke baare mein likhein..." />

          <div className="pf-row">
            <div>
              <label className="pf-label">Category *</label>
              <select className="pf-input" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pf-label">Size (ml) *</label>
              <input className="pf-input" type="number" min="1" name="sizeMl" value={form.sizeMl} onChange={handleChange} placeholder="100" />
            </div>
          </div>
        </section>

        {/* Price and stock */}
        <section className="pf-card">
          <h3>Price and Stock</h3>
          <div className="pf-row">
            <div>
              <label className="pf-label">Price (PKR) *</label>
              <input className="pf-input" type="number" min="1" name="price" value={form.price} onChange={handleChange} placeholder="5000" />
            </div>
            <div>
              <label className="pf-label">Discount Price (optional)</label>
              <input className="pf-input" type="number" min="0" name="discountPrice" value={form.discountPrice} onChange={handleChange} placeholder="4500" />
            </div>
            <div>
              <label className="pf-label">Stock *</label>
              <input className="pf-input" type="number" min="0" name="stock" value={form.stock} onChange={handleChange} placeholder="20" />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="pf-card">
          <h3>Fragrance Notes</h3>
          <div className="pf-row">
            <div>
              <label className="pf-label">Top</label>
              <input className="pf-input" name="top" value={form.top} onChange={handleChange} placeholder="Bergamot" />
            </div>
            <div>
              <label className="pf-label">Heart</label>
              <input className="pf-input" name="heart" value={form.heart} onChange={handleChange} placeholder="Rose" />
            </div>
            <div>
              <label className="pf-label">Base</label>
              <input className="pf-input" name="base" value={form.base} onChange={handleChange} placeholder="Oud" />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="pf-card">
          <h3>Images ({images.length}/{MAX_IMAGES})</h3>
          <p className="pf-hint">JPG, PNG ya WEBP, har image 2 MB tak. Pehli image main image hogi.</p>

          <div className="pf-images">
            {images.map((img, index) => (
              <div className="pf-img" key={img.key}>
                <img src={img.url} alt="" />
                {index === 0 && <span className="pf-main">Main</span>}
                <div className="pf-img-actions">
                  {index !== 0 && (
                    <button type="button" onClick={() => makeMain(img.key)}>
                      Set main
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(img.key)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="pf-add-img">
                <span>+ Add</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFiles} />
              </label>
            )}
          </div>
        </section>

        {/* Visibility */}
        <section className="pf-card">
          <h3>Visibility</h3>
          <label className="pf-check">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active (store par dikhao)
          </label>
          <label className="pf-check">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
            Featured (home page par dikhao)
          </label>
        </section>

        <div className="pf-actions">
          <Link to="/admin/products" className="pf-cancel">Cancel</Link>
          <button type="submit" className="pf-save" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}