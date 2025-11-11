import "./style.css";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import { useAuth } from "../../Utils/AuthContext";
import { getAllGhlUsersApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { useEffect, useState } from "react";
import axiosInstance from "../../Apis/axiosInstance";
import toast from "react-hot-toast";

const RegisterGhlUser = () => {
  const { isSuperAdmin, companyId } = useAuth();

  const [ghlUsers, setGhlUsers] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch GHL Users
  const getGhlUsers = async () => {
    try {
      const companyToFetch = isSuperAdmin ? selectedCompanyId : companyId;
      if (!companyToFetch) return;

      const res = await getAllGhlUsersApi(companyToFetch);
      if (res?.data?.success) {
        setGhlUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong");
    }
  };

  useEffect(() => {
    if (selectedCompanyId || (!isSuperAdmin && companyId)) {
      getGhlUsers();
    }
  }, [selectedCompanyId, companyId]);

  // ✅ Register Selected GHL User
  const registerGhlUser = async () => {
    if (!selectedUser) return toast.error("Select a user first");
    if (!password) return toast.error("Enter a password");

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/signup/ghl-user", {
        companyId: isSuperAdmin ? selectedCompanyId : companyId,
        ghlUserId: selectedUser.id,
        password,
      });

      if (res?.data?.success) {
        toast.success(res.data.message || "Signup success");

        // ✅ Reset all fields (except company)
        setSelectedUser(null);
        setPassword("");
        await getGhlUsers(); // refresh user list after signup
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-ghl-container">
      <h2>Register GHL User</h2>

      {/* Company Selector (Super Admin only) */}
      {isSuperAdmin && (
        <div className="form-section">
         
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* GHL User Dropdown */}
      <div className="form-section">
        <label>Select GHL User</label>
        <select
          value={selectedUser?.id || ""}
          onChange={(e) => {
            const user = ghlUsers.find((u) => u.id === e.target.value);
            setSelectedUser(user);
          }}
        >
          <option value="">Select user...</option>
          {ghlUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {/* Password Input */}
      <div className="form-section">
        <label>Set Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        className="register-btn"
        onClick={registerGhlUser}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register User"}
      </button>
    </div>
  );
};

export default RegisterGhlUser;
