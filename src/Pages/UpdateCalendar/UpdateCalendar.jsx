import React, { useState } from "react";
import "./style.css";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import updateBrandingApi from "../../Apis/SuperAdminApis/UpdateBrandingApi";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import toast from "react-hot-toast";


const UpdateCalendar = () => {
  const { companyId, isSuperAdmin } = useAuth(); // ✅ include isSuperAdmin

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill test data
  const [calendarId, setCalendarId] = useState("");
  const [calendarEmbeddedCode, setCalendarEmbeddedCode] = useState(
    ""
  );
  const [calendarPrice, setCalendarPrice] = useState("");

  const handleUpdate = async () => {
    const effectiveCompanyId = isSuperAdmin ? selectedCompanyId : companyId; // ✅ pick correct ID

    if (!effectiveCompanyId) {
      toast.error("Please select a company before updating.");
      return;
    }

    if (!calendarId || !calendarEmbeddedCode || !calendarPrice) {
      toast.error("Please fill all fields before updating.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        calendarId,
        calendarEmbeddedCode,
        calendarPrice: Number(calendarPrice),
      };

      const response = await updateBrandingApi(effectiveCompanyId, payload);

      if (response?.data?.success) {
        toast.success(response.data.message || "Calendar updated successfully!");
      } else {
        toast.error(response?.data?.message || "Failed to update calendar.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const showForm =
    !isSuperAdmin || (isSuperAdmin && selectedCompanyId); // ✅ Only show rest when company selected

  return (
    <div className="update-calendar-container">
      <h2 className="update-calendar-title">Update Calendar Details</h2>

      {/* ✅ Company Selector only for Super Admin */}
      {isSuperAdmin && (
        <div className="form-section">
          
          <CompanySelector
            setSelectedCompanyId={setSelectedCompanyId}
            selectedCompanyId={selectedCompanyId}
          />
        </div>
      )}

      {/* ✅ Show rest of the form only after company selection (Super Admin) OR for normal Company Admin */}
      {showForm && (
        <>
          {/* Calendar ID Selector */}
          <div className="form-section">
            <label>Calendar</label>
            <CalendarSelector
              selectedCalendarId={calendarId}
              setSelectedCalendarId={setCalendarId}
              mappingFunctionality={false}
              company={selectedCompanyId}
              setCalendarEmbeddedCode={setCalendarEmbeddedCode}
              setCalendarPrice={setCalendarPrice}
            />
          </div>

          {/* Embedded Code */}
          <div className="form-section">
            <label>Calendar Embedded Code</label>
            <textarea
              value={calendarEmbeddedCode}
              onChange={(e) => setCalendarEmbeddedCode(e.target.value)}
              rows="8"
              className="textarea-input"
              placeholder="Paste your embedded code here..."
            />
          </div>

          {/* Price */}
          <div className="form-section">
            <label>Calendar Price ($)</label>
            <input
              type="number"
              className="text-input"
              value={calendarPrice}
              onChange={(e) => setCalendarPrice(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="update-btn"
          >
            {loading ? "Updating..." : "Update Calendar"}
          </button>
        </>
      )}
    </div>
  );
};

export default UpdateCalendar;
