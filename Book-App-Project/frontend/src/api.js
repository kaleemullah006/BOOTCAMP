
const API = import.meta.env.VITE_API_URL;

// Books fetch karne ke liye
export async function getBooks(search = "", category = "") {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (category) params.set("category", category);

  const res = await fetch(`${API}/books?${params}`);

  if (!res.ok) {
    throw new Error("Books load nahi hui");
  }

  return res.json();
}

// Categories fetch karne ke liye
export async function getCategories() {
  const res = await fetch(`${API}/books/categories`);

  if (!res.ok) {
    throw new Error("Categories load nahi hui");
  }

  return res.json();
}

// Download count update karne ke liye
export function countDownload(id) {
  fetch(`${API}/books/${id}/download`, {
    method: "POST",
  }).catch(() => {});
}
// ---------- Admin ----------
const getToken = () => localStorage.getItem("adminToken");

async function adminRequest(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await res.json().catch(() => ({}));

  // Token expire ho gaya to wapas login par
  if (res.status === 401 && token) {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  }

  if (!res.ok) throw new Error(data.message || "Kuch masla aa gaya");
  return data;
}

export const adminLogin = (password) =>
  adminRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

export const getUploadUrl = (fileName) =>
  adminRequest("/books/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName }),
  });

export const createBook = (book) =>
  adminRequest("/books", { method: "POST", body: JSON.stringify(book) });

export const deleteBook = (id) =>
  adminRequest(`/books/${id}`, { method: "DELETE" });