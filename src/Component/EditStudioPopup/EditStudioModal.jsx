import React, { useEffect, useState } from "react";
import CalendarSelector from "../CalendarSelector/CalendarSelector";
import {
  addCalendarApi,
  getStudioAyIdApi,
  removeMappedCalendarApi,
  updateDefaultCalendarApi,
  updateStudioFormApi,
} from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import "./style.css";

const EditStudioModal = ({ selectedStudioId, studioName, onClose }) => {
  const { companyId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studioDetails, setStudioDetails] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  // ✅ NEW state for consent form editing
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [clientConsentForm, setClientConsentForm] = useState("");
  const [staffConsentForm, setStaffConsentForm] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  // ✅ Fetch studio details on mount
  const fetchStudioDetails = async () => {
    try {
      setLoading(true);
      const res = await getStudioAyIdApi(selectedStudioId, companyId);
      if (res?.data?.studio) {
        setStudioDetails(res.data.studio);
        setClientConsentForm(res.data.studio.clientConsentForm || "");
        setStaffConsentForm(res.data.studio.staffConsentForm || "");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load studio details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioDetails();
  }, [selectedStudioId]);

  // ✅ Add new calendar
  const handleAddCalendar = async () => {
    if (!selectedCalendarId)
      return toast.error("Please select a calendar first.");

    if (studioDetails?.calendars?.includes(selectedCalendarId))
      return toast.error("This calendar is already linked.");

    try {
      setSaving(true);
      const res = await addCalendarApi(selectedStudioId, {
        calendars: [selectedCalendarId],
      });

      if (res.data.success) {
        toast.success("Calendar added successfully!");
        await fetchStudioDetails();
        setSelectedCalendarId("");
      } else {
        toast.error(res.data.message || "Failed to add calendar.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error adding calendar.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Remove calendar (cannot remove default)
  const handleRemoveCalendar = async (calendarId) => {
    if (calendarId === studioDetails?.defaultCalendar) {
      return toast.error("You cannot remove the default calendar.");
    }

    try {
      setSaving(true);
      const res = await removeMappedCalendarApi(selectedStudioId, calendarId);
      if (res.data.success) {
        toast.success("Calendar removed successfully!");
        await fetchStudioDetails();
      } else {
        toast.error(res.data.message || "Failed to remove calendar.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error removing calendar.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Update default calendar
  const handleUpdateDefault = async (newDefaultId) => {
    if (newDefaultId === studioDetails.defaultCalendar) {
      return toast("Already set as default.");
    }

    try {
      setSaving(true);
      const res = await updateDefaultCalendarApi(selectedStudioId, {
        defaultCalendar: newDefaultId,
      });
      if (res.data.success) {
        toast.success("Default calendar updated!");
        await fetchStudioDetails();
      } else {
        toast.error(res.data.message || "Failed to update default calendar.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error updating default calendar.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Update Consent Form Data
  const handleUpdateConsentForm = async () => {
    if (!formChanged) return toast("No changes to save.");

    try {
      setSaving(true);
      const res = await updateStudioFormApi(selectedStudioId, {
        clientConsentForm,
        staffConsentForm,
      });
      if (res?.data?.success) {
        toast.success("Consent forms updated successfully!");
        setFormChanged(false);
        await fetchStudioDetails();
      } else {
        toast.error(res.data.message || "Failed to update consent forms.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error updating consent forms.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="edit-studio-modal center-loader">
          <MediumSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="edit-studio-modal">
        <div className="modal-header">
          <h2>Manage Calendars for {studioName}</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="modal-body">
          <h4>Linked Calendars</h4>
          {studioDetails?.calendars?.length > 0 ? (
            <ul className="calendar-list">
              {studioDetails.calendars.map((cal) => (
                <li key={cal} className="calendar-item">
                  <span className="calendar-id">
                    {cal}
                    {cal === studioDetails.defaultCalendar && (
                      <span className="default-badge">Default</span>
                    )}
                  </span>

                  <div className="calendar-actions">
                    {cal !== studioDetails.defaultCalendar && (
                      <>
                        <button
                          onClick={() => handleUpdateDefault(cal)}
                          className="set-default-btn"
                          disabled={saving}
                        >
                          Set as Default
                        </button>
                        <button
                          onClick={() => handleRemoveCalendar(cal)}
                          className="remove-btn"
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No calendars linked yet.</p>
          )}

          <hr className="divider" />

          <div className="add-calendar-section">
            <CalendarSelector
              selectedCalendarId={selectedCalendarId}
              setSelectedCalendarId={setSelectedCalendarId}
            />
            <button
              onClick={handleAddCalendar}
              className="add-btn"
              disabled={saving}
            >
              ➕ Add Calendar
            </button>
          </div>

          {/* ✅ Toggle to show Client/Staff Consent Form */}
          <hr className="divider" />
          <button
            className="consent-toggle-btn"
            onClick={() => setShowConsentForm((prev) => !prev)}
          >
            {showConsentForm
              ? "Hide Consent Form Settings"
              : "Edit Client & Staff Consent Forms"}
          </button>

          {showConsentForm && (
            <div className="consent-form-section">
              <div className="form-group">
                <label>Client Consent Form</label>
                <textarea
                  value={clientConsentForm}
                  onChange={(e) => {
                    setClientConsentForm(e.target.value);
                    setFormChanged(true);
                  }}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Staff Consent Form</label>
                <textarea
                  value={staffConsentForm}
                  onChange={(e) => {
                    setStaffConsentForm(e.target.value);
                    setFormChanged(true);
                  }}
                  rows="4"
                />
              </div>

              {formChanged && (
                <button
                  onClick={handleUpdateConsentForm}
                  className="save-consent-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Forms"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
         <div className="close-modal-button" onClick={onClose}>
        x
      </div>
      </div>
     
    </div>
  );
};

export default EditStudioModal;
