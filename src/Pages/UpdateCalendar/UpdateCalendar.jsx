import React, { useState, useEffect } from "react";
import "./style.css";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import updateBrandingApi from "../../Apis/SuperAdminApis/UpdateBrandingApi";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import toast from "react-hot-toast";

const UpdateCalendar = () => {
  const { companyId, isSuperAdmin } = useAuth();

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);

  // form
  const [calendarId, setCalendarId] = useState("");
  const [calendarEmbeddedCode, setCalendarEmbeddedCode] = useState("");
  const [calendarPrice, setCalendarPrice] = useState("");

  // derived
  const effectiveCompanyId = isSuperAdmin ? selectedCompanyId : companyId;
  const showForm = !!effectiveCompanyId;

  useEffect(() => {
    // clear form when company changes
    setCalendarId("");
    setCalendarEmbeddedCode("");
    setCalendarPrice("");
  }, [effectiveCompanyId]);

  const validate = () => {
    if (!effectiveCompanyId) return "Please select a company.";
    if (!calendarId) return "Please select a calendar.";
    if (!calendarEmbeddedCode || !calendarEmbeddedCode.trim())
      return "Please provide embedded code.";
    if (!calendarPrice || isNaN(Number(calendarPrice)))
      return "Please enter a valid price.";
    return null;
  };

  const handleUpdate = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      setLoading(true);
      const payload = {
        calendarId,
        calendarEmbeddedCode,
        calendarPrice: Number(calendarPrice),
      };

      const res = await updateBrandingApi(effectiveCompanyId, payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Calendar updated successfully!");
      } else {
        toast.error(res?.data?.message || "Failed to update calendar.");
      }
    } catch (e) {
      console.error("UpdateCalendar error:", e);
      toast.error(e?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uc-wrap">
      <header className="uc-header">
        <h2 className="uc-title">Update Calendar Details</h2>
        <p className="uc-sub">Set embedded code and pricing for a calendar</p>
      </header>

      <div className="uc-card">
        {/* Company selector (SuperAdmin only) */}
        {isSuperAdmin && (
          <div className="uc-row">
            <label className="uc-label">Select Company</label>
            <div className="uc-control">
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </div>
          </div>
        )}

        {/* hint when super admin hasn't selected a company */}
        {isSuperAdmin && !selectedCompanyId && (
          <div className="uc-hint">Please select a company to continue.</div>
        )}

        {/* main form (only when company selected or for company admin) */}
        {showForm ? (
          <>
            <div className="uc-row uc-row--stackable">
              <div className="uc-col">
                
                <CalendarSelector
                  selectedCalendarId={calendarId}
                  setSelectedCalendarId={setCalendarId}
                  mappingFunctionality={false}
                  company={effectiveCompanyId}
                  setCalendarEmbeddedCode={setCalendarEmbeddedCode}
                  setCalendarPrice={setCalendarPrice}
                />
              </div>

              <div className="uc-col uc-col--small">
                <label className="uc-label">Price ($)</label>
                <input
                  className="uc-input"
                  type="number"
                  value={calendarPrice}
                  onChange={(e) => setCalendarPrice(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
            </div>

            <div className="uc-row">
              <label className="uc-label">Calendar Embedded Code</label>
              <textarea
                className="uc-textarea"
                rows={6}
                placeholder="<iframe src=...>"
                value={calendarEmbeddedCode}
                onChange={(e) => setCalendarEmbeddedCode(e.target.value)}
              />
            </div>

            {/* preview (if user pasted an iframe or html snippet) */}
            {calendarEmbeddedCode.trim() && (
              <div className="uc-preview">
                <div className="uc-preview-title">Preview (iframe may be blocked by CORS)</div>
                <div className="uc-preview-box" dangerouslySetInnerHTML={{ __html: calendarEmbeddedCode }} />
              </div>
            )}

            <div className="uc-actions">
              <button
                className="uc-btn uc-btn--primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? <><MediumSpinner /> <span style={{marginLeft:8}}>Updating…</span></> : "Update Calendar"}
              </button>
            </div>
          </>
        ) : (
          <div className="uc-hint">Select a company to load calendar options.</div>
        )}
      </div>
    </div>
  );
};

export default UpdateCalendar;
