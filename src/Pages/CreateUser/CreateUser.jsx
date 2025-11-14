import React, { useState } from "react";
import { createUserApi } from "../../Apis/AuthApi/AuthApi";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import "./style.css"; // use the new scoped css file name

const CreateUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setUserData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (
      !userData.name.trim() ||
      !userData.email.trim() ||
      !userData.password.trim() ||
      !userData.role.trim() ||
      !userData.phone.toString().trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (userData.role === "company_admin" && !selectedCompanyId) {
      toast.error("Please select a company for company admin.");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...userData, companyId: selectedCompanyId || undefined };
      const response = await createUserApi(payload, selectedCompanyId);
      toast.success("User created successfully!");
      // reset
      setUserData({ name: "", email: "", password: "", role: "", phone: "" });
      setSelectedCompanyId("");
    
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.error || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    userData.name.trim() &&
    userData.email.trim() &&
    userData.password.trim() &&
    userData.role.trim() &&
    userData.phone.toString().trim();

  return (
    <div className="cu-page-wrap">
      <div className="cu-card">
        <header className="cu-card-header">
          <h2 className="cu-title">Create New User</h2>
          <p className="cu-sub">Add a user and assign role & company (if company admin).</p>
        </header>

        <form className="cu-form" onSubmit={handleSubmit}>
          {/* row: name + email */}
          <div className="cu-row">
            <div className="cu-col cu-col--grow">
              <label className="cu-label">
                <span className="cu-required">*</span> Name
              </label>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="cu-input"
                type="text"
                autoComplete="name"
              />
            </div>

            <div className="cu-col cu-col--grow">
              <label className="cu-label">
                <span className="cu-required">*</span> Email
              </label>
              <input
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="cu-input"
                type="email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* row: password + phone (phone uses PhoneInput) */}
          <div className="cu-row">
            <div className="cu-col cu-col--grow">
              <label className="cu-label">
                <span className="cu-required">*</span> Password
              </label>
              <input
                name="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Choose a secure password"
                className="cu-input"
                autoComplete="new-password"
              />
            </div>

            <div className="cu-col cu-col--grow">
              <label className="cu-label">
                <span className="cu-required">*</span> Phone
              </label>
              <div className="cu-phone-wrapper">
                <PhoneInput
                  country={"in"}
                  value={userData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{ name: "phone", required: true }}
                  containerClass="cu-phone-container"
                  inputClass="cu-phone-input"
                />
              </div>
            </div>
          </div>

          {/* role */}
          <div className="cu-row cu-row--single">
            <div className="cu-col cu-col--full">
              <label className="cu-label">
                <span className="cu-required">*</span> Role
              </label>
              <div className="cu-radio-group" role="radiogroup" aria-label="role">
                <label className="cu-radio">
                  <input
                    type="radio"
                    name="role"
                    value="company_admin"
                    checked={userData.role === "company_admin"}
                    onChange={handleChange}
                  />
                  Company Admin
                </label>

                <label className="cu-radio">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={userData.role === "admin"}
                    onChange={handleChange}
                  />
                  Admin
                </label>
              </div>
            </div>
          </div>

          {/* only show company selector when company_admin selected */}
          {userData.role === "company_admin" && (
            <div className="cu-row cu-row--single">
              <div className="cu-col cu-col--full">
                <label className="cu-label">Assign Company</label>
                <CompanySelector
                  selectedCompanyId={selectedCompanyId}
                  setSelectedCompanyId={setSelectedCompanyId}
                />
              </div>
            </div>
          )}

          {/* actions */}
          <div className="cu-actions">
            <button
              type="submit"
              className="cu-btn cu-btn--primary"
              disabled={!isFormValid || loading}
            >
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
