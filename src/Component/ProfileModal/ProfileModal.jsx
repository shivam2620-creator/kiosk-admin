import React, { useState } from "react";
import { useAuth } from "../../Utils/AuthContext";
import { FaClosedCaptioning } from "react-icons/fa";
import "./style.css";
import { IoMdClose } from "react-icons/io";

const ProfileModal = ({onClose}) => {
  const { user, companyDetail,isSuperAdmin } = useAuth();
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  


  return (
    <div className="profile-modal">
      <div className="modal-box">

        <h2 className="modal-title">User Profile</h2>

        <div className="section">
          <h3>User Details</h3>
          <div className="info-grid">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> <span className={`status ${user.status}`}>{user.status}</span></p>
          </div>
        </div>

       { !isSuperAdmin &&  <div className="toggle-btn-container">
          <button
            className="toggle-btn"
            onClick={() => setShowCompanyDetail((prev) => !prev)}
          >
            {showCompanyDetail ? "Hide Company Details" : "See Company Details"}
          </button>
        </div>}

        {showCompanyDetail && (
          <div className="section fade-in company-detail-section">
            <h3>Company Details</h3>
            <div className="info-grid">
              <p><strong>Name:</strong> {companyDetail?.name}</p>
              <p><strong>Email:</strong> {companyDetail?.email}</p>
              <p><strong>Phone:</strong> {companyDetail?.phone}</p>
              <p><strong>Owner:</strong> {companyDetail?.owner}</p>
              <p><strong>Address:</strong> {companyDetail?.address}</p>
              <p><strong>Status:</strong> <span className={`status ${companyDetail?.status}`}>{companyDetail?.status}</span></p>
              <p><strong>Setup Status:</strong> {companyDetail?.setupStatus}</p>
            </div>

            {/* Location Section */}
            <div className="section location-section">
              <h3>Location</h3>
              <div className="info-grid">
                <p><strong>First Name:</strong> {companyDetail?.location?.firstName}</p>
                <p><strong>Last Name:</strong> {companyDetail?.location?.lastName}</p>
                <p><strong>Name:</strong> {companyDetail?.location?.name}</p>
                <p><strong>City:</strong> {companyDetail?.location?.city}</p>
                <p><strong>Country:</strong> {companyDetail?.location?.country}</p>
                <p><strong>Phone:</strong> {companyDetail?.location?.phone}</p>
                <p><strong>Postal Code:</strong> {companyDetail?.location?.postalCode}</p>
                <p><strong>State:</strong> {companyDetail?.location?.state}</p>
                <p><strong>Website:</strong> {companyDetail?.location?.website}</p>
                <p><strong>Address:</strong> {companyDetail?.location?.address}</p>
                <p><strong>Locale:</strong> {companyDetail?.location?.locale}</p>
              </div>
            </div>
          </div>
        )}
        <button className="close-profile-btn" onClick={onClose}>
           <IoMdClose size={33} />
        </button>
        
      </div>
    
    </div>
  );
};

export default ProfileModal;
