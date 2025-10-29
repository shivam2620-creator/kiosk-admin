// axiosInstance.js
import axios from "axios";

let getValidIdTokenFn = null;
let handleLogoutFn = null;

// 💡 Setup function to inject auth utilities
export const setupAxiosAuth = ({ getValidIdToken, handleLogout }) => {
  getValidIdTokenFn = getValidIdToken;
  handleLogoutFn = handleLogout;
};

// Create global axios instance
const axiosInstance = axios.create({
  baseURL: "https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net",
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    if (!getValidIdTokenFn) return config;
    try {
      const token = await getValidIdTokenFn();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error("Error getting valid token:", err);
      handleLogoutFn?.("Session expired. Please log in again.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response Interceptor
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = await getValidIdTokenFn?.();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        handleLogoutFn?.("Session expired. Please log in again.");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
