import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Utils/AuthContext";
import { IoMdClose } from "react-icons/io";
import "./style.css";

const ProfileModal = ({ onClose }) => {
  const { user = {}, companyDetail = {}, isSuperAdmin } = useAuth();
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Prevent body scroll while modal is open & save/restore focus
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    // focus the first focusable element in modal after mount
    const focusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();

    return () => {
      document.body.style.overflow = "";
      if (previouslyFocused.current) {
        previouslyFocused.current.focus?.();
      }
    };
  }, []);

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      // simple trap: keep focus inside modal with Tab
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
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

  // Close when clicking outside modal-box
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Safe helpers
  const safe = (val) => (val === undefined || val === null || val === "" ? "-" : val);
  const safeNested = (obj, key) => (obj && obj[key] ? obj[key] : "-");

  return (
    <div
      className="profile-modal"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profileModalTitle"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="modal-box"
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
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
          <div
            id="companyDetailSection"
            className="section fade-in company-detail-section"
          >
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

            {/* Location Section */}
            <div className="section location-section">
              <h3>Location</h3>
              <div className="info-grid">
                <p><strong>First Name:</strong> {safeNested(companyDetail.location || {}, "firstName")}</p>
                <p><strong>Last Name:</strong> {safeNested(companyDetail.location || {}, "lastName")}</p>
                <p><strong>Name:</strong> {safeNested(companyDetail.location || {}, "name")}</p>
                <p><strong>City:</strong> {safeNested(companyDetail.location || {}, "city")}</p>
                <p><strong>Country:</strong> {safeNested(companyDetail.location || {}, "country")}</p>
                <p><strong>Phone:</strong> {safeNested(companyDetail.location || {}, "phone")}</p>
                <p><strong>Postal Code:</strong> {safeNested(companyDetail.location || {}, "postalCode")}</p>
                <p><strong>State:</strong> {safeNested(companyDetail.location || {}, "state")}</p>
                <p><strong>Website:</strong> {safeNested(companyDetail.location || {}, "website")}</p>
                <p><strong>Address:</strong> {safeNested(companyDetail.location || {}, "address")}</p>
                <p><strong>Locale:</strong> {safeNested(companyDetail.location || {}, "locale")}</p>
              </div>
            </div>
          </div>
        )}

        <button
          className="close-profile-btn"
          onClick={onClose}
          aria-label="Close profile dialog"
        >
          <IoMdClose size={28} />
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
