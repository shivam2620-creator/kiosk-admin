import { useState } from "react";
import { createCompanyApi } from "../../Apis/SuperAdminApis/CreateCompanyApi";
import SyncGhlUserAndCalenderApi from "../../Apis/SyncGhlUserAndCalender";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import PhoneInput from "react-phone-input-2";
import toast from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import "./style.css";
import { useNavigate } from "react-router-dom";

const CreateCompanyForm = ({ code }) => {
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [SyncGhlUserAndCalenderLoading, setSyncGhlUserAndCalenderLoading] =
    useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    owner: "",
    code: code || "",
  });

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Email validation
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Form validation
  const isFormValid =
    formData.name.trim() &&
    isValidEmail(formData.email) &&
    formData.address.trim() &&
    formData.phone.trim().length >= 7 &&
    formData.owner.trim();

  // ✅ Sync function
  const syncGhlUserAndCalender = async (companyId) => {
    try {
      setSyncGhlUserAndCalenderLoading(true);
      const response = await SyncGhlUserAndCalenderApi(companyId);
      if (response?.data?.success) {
        toast.success(
          response?.data?.message ||
            "GHL User and Calendar synced successfully"
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Error syncing GHL User and Calendar:", error);
    } finally {
      setSyncGhlUserAndCalenderLoading(false);
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill all fields correctly before submitting!");
      return;
    }

    try {
      setCreateUserLoading(true);
      const response = await createCompanyApi(formData);
      if (response?.data?.success) {
        toast.success(
          response?.data?.message || "Company created successfully"
        );
      }
      await syncGhlUserAndCalender(response?.data?.company?.id);
    } catch (error) {
      
      toast.error("Failed to create company!");
    } finally {
      setCreateUserLoading(false);
    }
  };

  return SyncGhlUserAndCalenderLoading ? (
    <div className="syncing-ghl-loading-container">
      <MediumSpinner />
      <p>Syncing GHL User and Calendar...</p>
    </div>
  ) : (
    <div className="company-form-container">
      <h2>Create Company</h2>
      <form className="company-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            <span className="required">*</span> Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>

      
          <div className="form-group half-width">
            <label htmlFor="email">
              <span className="required">*</span> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter company email"
            />
          </div>

          <div className="form-group half-width">
            <label htmlFor="phone">
              <span className="required">*</span> Phone Number
            </label>
            <PhoneInput
              country={"in"}
              value={formData.phone}
              onChange={(phone) =>
                setFormData((prev) => ({ ...prev, phone }))
              }
              inputStyle={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        

        <div className="form-group">
          <label htmlFor="address">
            <span className="required">*</span> Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter company address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="owner">
            <span className="required">*</span> Owner
          </label>
          <input
            type="text"
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="Enter owner name"
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!isFormValid || createUserLoading}
        >
          {createUserLoading && <SmallSpinner />}
          {createUserLoading ? "Creating Company..." : "Create Company"}
        </button>
      </form>
    </div>
  );
};

export default CreateCompanyForm;
