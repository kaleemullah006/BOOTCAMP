
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Common API request helper
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Get all products
export function getProducts() {
  return request("/products");
}

// Get single product by ID or slug
export function getProduct(identifier) {
  return request(`/products/${identifier}`);
}

export { API_URL };
