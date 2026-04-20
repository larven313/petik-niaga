import axios from "axios";
// kalo mau simple bisa tambahin  Authorization: `Bearer ${token}`
// axios.get(`${BASE_URL}/jenis-produk`, {
//   headers: {
//     Authorization: `Bearer ${token}`
//   }
// });

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL, // ← pakai JWT API URL
});

// Setiap request otomatis tambah token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau 401, redirect ke login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // ← otomatis logout kalau token expired
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
