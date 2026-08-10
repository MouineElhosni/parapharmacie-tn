import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "/uploads";

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

export const productImage = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${UPLOADS_BASE}/${image}`;
};

export default API;
