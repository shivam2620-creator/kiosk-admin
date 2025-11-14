// ProfileModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Utils/AuthContext";
import { IoMdClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { resetPasswordApi } from "../../Apis/AuthApi/AuthApi";
import toast from "react-hot-toast";
import "./style.css";

const ProfileModal = ({ onClose }) => {
  const { user = {}, companyDetail = {}, isSuperAdmin } = useAuth();
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  // reset form state
  const [resetEmail, setResetEmail] = useState(user.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Prevent body scroll while modal is open & restore focus
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const focusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();

    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, []);

  // Close on Esc + trap focus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Safe helpers
  const safe = (val) => (val ? val : "-");
  const safeNested = (obj, key) => (obj && obj[key] ? obj[key] : "-");

  // Reset password submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!resetEmail || !oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    // optional extra validation: new != old
    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    try {
      setResetLoading(true);
      const payload = {
        email: resetEmail,
        oldPassword,
        newPassword,
      };

      const res = await resetPasswordApi(payload); // assuming API returns { success: true/false, message }
  
      if (res?.data?.message) {
        toast.success(res.data.message || "Password updated successfully");
        
        // clear form and hide
        setOldPassword("");
        setNewPassword("");
        setShowResetForm(false);
      } else {
        
      }
    } catch (err) {
      console.error("Reset password error:", err);
      const msg = err?.response?.data?.error || err?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  // Cancel/reset form
  const handleResetCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setShowResetForm(false);
  };

  return (
    <div
      className="profile-modal"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profileModalTitle"
      onMouseDown={handleOverlayClick}
    >
      <div className="modal-box" ref={modalRef} onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="profileModalTitle" className="modal-title">
          User Profile
        </h2>

        <div className="section">
          <h3>User Details</h3>
          <div className="info-grid">
            <p><strong>Name:</strong> {safe(user.name)}</p>
            <p><strong>Email:</strong> {safe(user.email)}</p>
            <p><strong>Phone:</strong> {safe(user.phone)}</p>
            <p><strong>Role:</strong> {safe(user.role)}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status ${user.status || "unknown"}`}>{safe(user.status)}</span>
            </p>
          </div>

          {/* ➤ Reset Password Button (toggles form) */}
          <div className="reset-btn-container">
            {!showResetForm ? (
              <button
                className="reset-password-btn"
                onClick={() => {
                  setResetEmail(user.email || "");
                  setShowResetForm(true);
                }}
              >
                Reset Password
              </button>
            ) : (
              <form className="reset-form" onSubmit={handleResetPasswordSubmit}>
                <div className="form-row">
                  <label htmlFor="resetEmail">Email</label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row password-row">
                  <label htmlFor="oldPassword">Old Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showOldPassword ? "Hide old password" : "Show old password"}
                      onClick={() => setShowOldPassword((s) => !s)}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-row password-row">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      onClick={() => setShowNewPassword((s) => !s)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="reset-form-actions">
                  <button type="submit" className="reset-submit-btn" disabled={resetLoading}>
                    {resetLoading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    className="reset-cancel-btn"
                    onClick={handleResetCancel}
                    disabled={resetLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="toggle-btn-container">
            <button
              className="toggle-btn"
              onClick={() => setShowCompanyDetail((prev) => !prev)}
              aria-expanded={showCompanyDetail}
              aria-controls="companyDetailSection"
            >
              {showCompanyDetail ? "Hide Company Details" : "See Company Details"}
            </button>
          </div>
        )}

        {showCompanyDetail && (
          <div id="companyDetailSection" className="section fade-in company-detail-section">
            <h3>Company Details</h3>
            <div className="info-grid">
              <p><strong>Name:</strong> {safe(companyDetail.name)}</p>
              <p><strong>Email:</strong> {safe(companyDetail.email)}</p>
              <p><strong>Phone:</strong> {safe(companyDetail.phone)}</p>
              <p><strong>Owner:</strong> {safe(companyDetail.owner)}</p>
              <p><strong>Address:</strong> {safe(companyDetail.address)}</p>
              <p><strong>Status:</strong> <span className={`status ${companyDetail.status || "unknown"}`}>{safe(companyDetail.status)}</span></p>
              <p><strong>Setup Status:</strong> {safe(companyDetail.setupStatus)}</p>
            </div>

            <div className="section location-section">
              <h3>Location</h3>
              <div className="info-grid">
                <p><strong>First Name:</strong> {safeNested(companyDetail.location, "firstName")}</p>
                <p><strong>Last Name:</strong> {safeNested(companyDetail.location, "lastName")}</p>
                <p><strong>Name:</strong> {safeNested(companyDetail.location, "name")}</p>
                <p><strong>City:</strong> {safeNested(companyDetail.location, "city")}</p>
                <p><strong>Country:</strong> {safeNested(companyDetail.location, "country")}</p>
                <p><strong>Phone:</strong> {safeNested(companyDetail.location, "phone")}</p>
                <p><strong>Postal Code:</strong> {safeNested(companyDetail.location, "postalCode")}</p>
                <p><strong>State:</strong> {safeNested(companyDetail.location, "state")}</p>
                <p><strong>Website:</strong> {safeNested(companyDetail.location, "website")}</p>
                <p><strong>Address:</strong> {safeNested(companyDetail.location, "address")}</p>
                <p><strong>Locale:</strong> {safeNested(companyDetail.location, "locale")}</p>
              </div>
            </div>
          </div>
        )}

        <button className="close-profile-btn" onClick={onClose} aria-label="Close profile dialog">
          <IoMdClose size={28} />
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
