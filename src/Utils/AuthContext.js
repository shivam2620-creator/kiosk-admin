import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getUserDetailsById } from "../Apis/AuthApi/AuthApi";
import { getCompanyDetailApi } from "../Apis/CompanyAdminApis/CompanyApis";
import toast from "react-hot-toast";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || undefined);
  const [companyId, setCompanyId] = useState("");
  const [companyDetail, setCompanyDetail] = useState(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const refreshIntervalRef = useRef(null);
  const FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

  // ✅ Load user from localStorage on startup
 useEffect(() => {
  const idToken = localStorage.getItem("idToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const expiry = localStorage.getItem("tokenExpiry");
  const storedUser = localStorage.getItem("userData");

  if (idToken && refreshToken && expiry && storedUser) {
    setUser(JSON.parse(storedUser));
    startTokenRefreshScheduler(refreshToken);
  }

  setLoading(false); // always finish loading, no redirect here
}, []);

  // ✅ Fetch user details
  const fetchUserDetails = async () => {
    if (!userId) return;
    let isMounted = true;
    try {
      setUserLoading(true);
      const userDetails = await getUserDetailsById(userId);
      if (!isMounted) return;
      const fetchedUser = userDetails?.data?.user;
      if (fetchedUser) {
        setUser(fetchedUser);
        setCompanyId(fetchedUser.companyId);
        setIsSuperAdmin(fetchedUser.role === "admin");
        setIsCompanyAdmin(fetchedUser.role === "company_admin");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      // redirect if fetching fails (token invalid or user not found)
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    } finally {
      if (isMounted) setUserLoading(false);
    }
    return () => {
      isMounted = false;
    };
  };

  // ✅ Fetch company details
  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    try {
      const res = await getCompanyDetailApi(companyId);
      if (res?.data?.success) {
        setCompanyDetail(res.data.company);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    if (companyId) fetchCompanyDetails();
  }, [companyId]);

  // ✅ Token Management
  const getValidIdToken = async () => {
    const idToken = localStorage.getItem("idToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiry = localStorage.getItem("tokenExpiry");

    if (idToken && expiry && Date.now() < expiry - 60 * 1000) {
      return idToken;
    }
    return await refreshTokenWithFirebase(refreshToken);
  };

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

      return data.id_token;
    } catch (err) {
      handleLogout("Session expired. Please log in again.");
      throw err;
    }
  };

  const startTokenRefreshScheduler = (refreshToken) => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);

    const id = setInterval(async () => {
      const expiry = localStorage.getItem("tokenExpiry");
      if (!expiry) return;
      const remaining = expiry - Date.now();
      if (remaining < 5 * 60 * 1000) {
        await refreshTokenWithFirebase(refreshToken);
      }
    }, 60 * 1000);

    refreshIntervalRef.current = id;
  };

  // ✅ Login
  const login = async (tokens, id) => {
    localStorage.setItem("idToken", tokens.idToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userId", id);
    localStorage.setItem("tokenExpiry", Date.now() + tokens.expiresIn * 1000);
    setUserId(id);
    startTokenRefreshScheduler(tokens.refreshToken);
  };

  // ✅ Logout (window.location version)
  const handleLogout = (message = "You have been logged out.") => {
    try {
      clearInterval(refreshIntervalRef.current);
      localStorage.clear();

      setUser(null);
      setUserId(null);
      setCompanyId(null);
      setCompanyDetail(null);
      setIsSuperAdmin(false);
      setIsCompanyAdmin(false);

      toast.error(message);

      // ✅ Full reload redirect for clean logout
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ Context value
  const value = {
    user,
    userLoading,
    login,
    handleLogout,
    getValidIdToken,
    isSuperAdmin,
    isCompanyAdmin,
    companyId,
    companyDetail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
