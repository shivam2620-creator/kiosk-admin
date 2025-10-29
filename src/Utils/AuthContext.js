// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshIntervalId, setRefreshIntervalId] = useState(null);

  const FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

  // ✅ Load user from storage on startup
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiry = localStorage.getItem("tokenExpiry");
    const storedUser = localStorage.getItem("userData");

    if (idToken && refreshToken && expiry && storedUser) {
      setUser(JSON.parse(storedUser));
      startTokenRefreshScheduler(refreshToken);
    }
    setLoading(false);
  }, []);

  // 🔑 Get a valid ID token (refresh if expired)
  const getValidIdToken = async () => {
    const idToken = localStorage.getItem("idToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiry = localStorage.getItem("tokenExpiry");

    if (idToken && expiry && Date.now() < expiry - 60 * 1000) {
      return idToken;
    }

    return await refreshTokenWithFirebase(refreshToken);
  };

  // 🔄 Refresh Token Logic
  const refreshTokenWithFirebase = async (refreshToken) => {
    try {
      const res = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        }
      );

      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();

      localStorage.setItem("idToken", data.id_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      localStorage.setItem("tokenExpiry", Date.now() + data.expires_in * 1000);

      console.log("✅ Token refreshed:", new Date().toLocaleTimeString());
      return data.id_token;
    } catch (err) {
      console.error("Refresh token failed:", err);
      handleLogout("Session expired. Please log in again.");
      throw err;
    }
  };

  // 🕒 Background auto-refresh every minute
  const startTokenRefreshScheduler = (refreshToken) => {
    if (refreshIntervalId) clearInterval(refreshIntervalId);

    const id = setInterval(async () => {
      const expiry = localStorage.getItem("tokenExpiry");
      if (!expiry) return;

      const remaining = expiry - Date.now();
      if (remaining < 5 * 60 * 1000) {
        await refreshTokenWithFirebase(refreshToken);
      }
    }, 60 * 1000);

    setRefreshIntervalId(id);
    console.log("⏳ Token refresh scheduler started");
  };

  // 🚪 Login user
  const login = (tokens) => {
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem(
      "tokenExpiry",
      Date.now() + tokens.expiresIn * 1000
    );
    startTokenRefreshScheduler(tokens.refreshToken);
    toast.success("Logged in successfully!");
  };

  // 🚫 Logout user
  const handleLogout = (message = "You have been logged out.") => {
    localStorage.clear();
    clearInterval(refreshIntervalId);
    setUser(null);
    toast.error(message);
    setTimeout(() => (window.location.href = "auth/login"), 800);
  };

  const value = {
    user,
    loading,
    login,
    handleLogout,
    getValidIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
