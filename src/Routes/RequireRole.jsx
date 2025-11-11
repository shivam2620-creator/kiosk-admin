import { Navigate } from "react-router-dom";
import { useAuth } from "../Utils/AuthContext";
import MediumSpinner from "../Utils/MediumSpinner/MediumSpinner";

const RequireRole = ({ role, children }) => {
  const { isSuperAdmin, isCompanyAdmin, userLoading} = useAuth();

  if (userLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <MediumSpinner />
      </div>
    );
  }

  // Determine actual user role
  const currentRole = isSuperAdmin
    ? "superAdmin"
    : isCompanyAdmin
    ? "companyAdmin"
    : "guest";

  // If role doesn’t match, block access
  if (currentRole !== role) {
    return <Navigate to="/" replace />;
  }

  // Authorized — render the page
  return children;
};

export default RequireRole;
