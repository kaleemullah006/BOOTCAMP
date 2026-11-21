import { API_URL } from "../api/api";

const TOKEN_KEY = "af_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());

// Admin ke saare protected API calls isi se hongi
export async function adminFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // Token expire ya ghalat ho to logout karke login page par bhejo
  if (response.status === 401) {
    removeToken();
    window.location.href = "/admin/login";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}