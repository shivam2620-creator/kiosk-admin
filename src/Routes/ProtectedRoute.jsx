import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const idToken = localStorage.getItem("idToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const expiry = localStorage.getItem("tokenExpiry");

  // user is not logged in
  if (!(idToken && refreshToken && expiry)) {
    return <Navigate to="/auth/login" replace />;
  }

  // user logged in — allow access
  return <Outlet />;
};

export default ProtectedRoute;
