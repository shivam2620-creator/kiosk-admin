import React, { use, useState } from "react";
import { createUserApi } from "../../Apis/AuthApi/AuthApi";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import "./style.css";

const CreateUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setUserData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.name || !userData.email || !userData.password || !userData.role || !userData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await createUserApi(userData, selectedCompanyId);
      toast.success("User created successfully!");
      console.log("User created successfully:", response);
      setUserData({
        name: "",
        email: "",
        password: "",
        role: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.error || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(userData).every((val) => val.trim() !== "");

  return (
    <div className="create-user-wrapper">
      <div className="create-user-card">
        <h2>Create New User</h2>

        <form className="create-user-form" onSubmit={handleSubmit}>
          {/* Name + Email */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="required">*</span> Name
              </label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>
                <span className="required">*</span> Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>
              <span className="required">*</span> Password
            </label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>
              <span className="required">*</span> Phone
            </label>
            <PhoneInput
              country={"in"}
              value={userData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                name: "phone",
                required: true,
              }}
              containerClass="phone-input-container"
              inputClass="phone-input-field"
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label>
              <span className="required">*</span> Role
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="company_admin"
                  checked={userData.role === "company_admin"}
                  onChange={handleChange}
                />
                Company Admin
              </label>
              <label>
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
        {userData.role === "company_admin" && <div><CompanySelector selectedCompanyId={selectedCompanyId} setSelectedCompanyId={setSelectedCompanyId} /> </div> }
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid || loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
