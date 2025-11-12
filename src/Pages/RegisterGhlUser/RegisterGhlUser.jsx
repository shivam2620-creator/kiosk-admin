import "./style.css";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import { useAuth } from "../../Utils/AuthContext";
import { getAllGhlUsersApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { useEffect, useState } from "react";
import axiosInstance from "../../Apis/axiosInstance";
import toast from "react-hot-toast";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";

const RegisterGhlUser = () => {
  const { isSuperAdmin, companyId } = useAuth();

  const [ghlUsers, setGhlUsers] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const effectiveCompany = isSuperAdmin ? selectedCompanyId : companyId;

  // Fetch GHL users for the effective company
  const getGhlUsers = async () => {
    try {
      if (!effectiveCompany) {
        setGhlUsers([]);
        return;
      }
      setFetchingUsers(true);
      const res = await getAllGhlUsersApi(effectiveCompany);
      if (res?.data?.success) {
        setGhlUsers(res.data.users || []);
      } else {
        setGhlUsers([]);
      }
    } catch (err) {
      console.error("getGhlUsers:", err);
      toast.error(err?.response?.data?.error || "Failed to fetch GHL users");
      setGhlUsers([]);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    // fetch when company selection changes or on mount for non-super admin
    if (effectiveCompany) getGhlUsers();
    else setGhlUsers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCompany]);

  // Register selected GHL user
  const registerGhlUser = async () => {
    if (!selectedUser) return toast.error("Please select a GHL user.");
    if (!password || password.trim().length < 6)
      return toast.error("Please enter a password (min 6 characters).");

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/signup/ghl-user", {
        companyId: effectiveCompany,
        ghlUserId: selectedUser.id,
        password,
      });

      if (res?.data?.success) {
        toast.success(res.data.message || "User registered successfully");
        // reset but keep company selected
        setSelectedUser(null);
        setPassword("");
        await getGhlUsers();
      } else {
        toast.error(res?.data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("registerGhlUser:", err);
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rghl-wrap">
      <header className="rghl-header">
        <h2 className="rghl-title">Register GHL User</h2>
        <p className="rghl-sub">Create a local account for an existing GHL user.</p>
      </header>

      <div className="rghl-card">
        {/* Company selector (super admin only) */}
        {isSuperAdmin && (
          <div className="rghl-row">
            <label className="rghl-label">Select Company</label>
            <div className="rghl-control">
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </div>
          </div>
        )}

        {/* If a company isn't selected and user is super admin: hint */}
        {isSuperAdmin && !selectedCompanyId && (
          <div className="rghl-hint">Please select a company to load GHL users.</div>
        )}

        {/* Main form area */}
        <div className="rghl-row">
          <div className="rghl-col rghl-col--left">
            <label className="rghl-label">Select GHL User</label>

            {fetchingUsers ? (
              <div className="rghl-loading-inline">
                <MediumSpinner />
              </div>
            ) : (
              <select
                className="rghl-select"
                value={selectedUser?.id || ""}
                onChange={(e) => {
                  const u = ghlUsers.find((x) => x.id === e.target.value);
                  setSelectedUser(u || null);
                }}
                aria-label="Select GHL User"
                disabled={!effectiveCompany || ghlUsers.length === 0}
              >
                <option value="">{effectiveCompany ? "Select a user..." : "Select company first"}</option>
                {ghlUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || `${u.firstName || ""} ${u.lastName || ""}`} — {u.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rghl-col rghl-col--right">
            <label className="rghl-label">Set Password</label>
            <input
              type="password"
              className="rghl-input"
              placeholder="Enter password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!selectedUser}
              aria-disabled={!selectedUser}
            />
          </div>
        </div>

        {/* Selected user preview */}
        {/* {selectedUser && (
          <div className="rghl-selected-preview">
            <div className="rghl-preview-left">
              <div className="rghl-preview-name">{selectedUser.name || `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`}</div>
              <div className="rghl-preview-email">{selectedUser.email}</div>
            </div>
            <div className="rghl-preview-right">
              <span className={`rghl-badge ${selectedUser.isMapped ? "mapped" : "unmapped"}`}>
                {selectedUser.isMapped ? "Mapped" : "Unmapped"}
              </span>
            </div>
          </div>
        )} */}

        {/* Action */}
        <div className="rghl-actions">
          <button
            className="rghl-btn rghl-btn--primary"
            onClick={registerGhlUser}
            disabled={loading || !selectedUser}
            aria-disabled={loading || !selectedUser}
          >
            {loading ? "Registering…" : "Register User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterGhlUser;
