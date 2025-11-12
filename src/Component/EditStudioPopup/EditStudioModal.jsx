import React, { useEffect, useRef, useState } from "react";
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

const EditStudioModal = ({ selectedStudioId, studioName, onClose, company }) => {
  const { companyId: authCompanyId, isSuperAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studioDetails, setStudioDetails] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  // Consent form editing
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [clientConsentForm, setClientConsentForm] = useState("");
  const [staffConsentForm, setStaffConsentForm] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  // refs for accessibility/focus trap
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // compute which company id to use (superadmin can pass company prop)
  const actualCompanyId = isSuperAdmin ? company || authCompanyId : authCompanyId;

  // Fetch studio details
  const fetchStudioDetails = async () => {
    if (!selectedStudioId) return;
    try {
      setLoading(true);
      const res = await getStudioAyIdApi(selectedStudioId, actualCompanyId);
      if (res?.data?.studio) {
        setStudioDetails(res.data.studio);
        setClientConsentForm(res.data.studio.clientConsentForm || "");
        setStaffConsentForm(res.data.studio.staffConsentForm || "");
        setFormChanged(false);
      } else {
        setStudioDetails(null);
      }
    } catch (err) {
      console.error("Failed to fetch studio details:", err);
      toast.error("Failed to load studio details");
      setStudioDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudioId, actualCompanyId]);

  // Accessibility: prevent body scroll, save & restore focus, focus first element
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";

    // focus first button inside modal after mount
    const toFocus = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (toFocus) toFocus.focus();

    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, []);

  // Close on Esc and trap tab focus inside modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
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

  // overlay click closes modal
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Add calendar
  const handleAddCalendar = async () => {
    if (!selectedCalendarId) return toast.error("Please select a calendar first.");
    if (studioDetails?.calendars?.includes(selectedCalendarId))
      return toast.error("This calendar is already linked.");

    try {
      setSaving(true);
      const res = await addCalendarApi(selectedStudioId, {
        calendars: [selectedCalendarId],
      });
      if (res?.data?.success) {
        toast.success("Calendar added successfully!");
        setSelectedCalendarId("");
        await fetchStudioDetails();
      } else {
        toast.error(res?.data?.message || "Failed to add calendar.");
      }
    } catch (err) {
      console.error("Error adding calendar:", err);
      toast.error("Error adding calendar.");
    } finally {
      setSaving(false);
    }
  };

  // Remove calendar
  const handleRemoveCalendar = async (calendarId) => {
    if (!studioDetails) return;
    if (calendarId === studioDetails?.defaultCalendar) {
      return toast.error("You cannot remove the default calendar.");
    }
    try {
      setSaving(true);
      const res = await removeMappedCalendarApi(selectedStudioId, calendarId);
      if (res?.data?.success) {
        toast.success("Calendar removed successfully!");
        await fetchStudioDetails();
      } else {
        toast.error(res?.data?.message || "Failed to remove calendar.");
      }
    } catch (err) {
      console.error("Error removing calendar:", err);
      toast.error("Error removing calendar.");
    } finally {
      setSaving(false);
    }
  };

  // Update default calendar
  const handleUpdateDefault = async (newDefaultId) => {
    if (!studioDetails) return;
    if (newDefaultId === studioDetails.defaultCalendar) {
      return toast("Already set as default.");
    }
    try {
      setSaving(true);
      const res = await updateDefaultCalendarApi(selectedStudioId, {
        defaultCalendar: newDefaultId,
      });
      if (res?.data?.success) {
        toast.success("Default calendar updated!");
        await fetchStudioDetails();
      } else {
        toast.error(res?.data?.message || "Failed to update default calendar.");
      }
    } catch (err) {
      console.error("Error updating default calendar:", err);
      toast.error("Error updating default calendar.");
    } finally {
      setSaving(false);
    }
  };

  // Update consent forms
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
        toast.error(res?.data?.message || "Failed to update consent forms.");
      }
    } catch (err) {
      console.error("Error updating consent forms:", err);
      toast.error("Error updating consent forms.");
    } finally {
      setSaving(false);
    }
  };

  // Safe render helper
  const safe = (v) => (v === undefined || v === null || v === "" ? "-" : v);

  // Loading view
  if (loading) {
    return (
      <div
        className="modal-overlay"
        ref={overlayRef}
        onMouseDown={handleOverlayClick}
        aria-modal="true"
        role="dialog"
      >
        <div className="edit-studio-modal center-loader" ref={modalRef}>
          <MediumSpinner />
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="editStudioTitle"
    >
      <div className="edit-studio-modal" ref={modalRef}>
        <div className="modal-header">
          <h2 id="editStudioTitle">Manage Calendars for {safe(studioName)}</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close manage calendars modal"
          >
            ✖
          </button>
        </div>

        <div className="modal-body">
          <h4>Linked Calendars</h4>

          {studioDetails?.calendars?.length > 0 ? (
            <ul className="calendar-list" aria-live="polite">
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
                          {saving ? "Saving..." : "Set as Default"}
                        </button>
                        <button
                          onClick={() => handleRemoveCalendar(cal)}
                          className="remove-btn"
                          disabled={saving}
                        >
                          {saving ? "Removing..." : "Remove"}
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
            <div style={{ flex: 1 }}>
              <CalendarSelector
                selectedCalendarId={selectedCalendarId}
                setSelectedCalendarId={setSelectedCalendarId}
                company={actualCompanyId}
              />
            </div>

            <div>
              <button
                onClick={handleAddCalendar}
                className="add-btn"
                disabled={saving}
                aria-disabled={saving}
              >
                {saving ? "Adding..." : "➕ Add Calendar"}
              </button>
            </div>
          </div>

          <hr className="divider" />

          <button
            className="consent-toggle-btn"
            onClick={() => setShowConsentForm((p) => !p)}
            aria-expanded={showConsentForm}
            aria-controls="consentFormSection"
          >
            {showConsentForm ? "Hide Consent Form Settings" : "Edit Client & Staff Consent Forms"}
          </button>

          {showConsentForm && (
            <div id="consentFormSection" className="consent-form-section">
              <div className="form-group">
                <label htmlFor="clientConsent">Client Consent Form</label>
                <textarea
                  id="clientConsent"
                  value={clientConsentForm}
                  onChange={(e) => {
                    setClientConsentForm(e.target.value);
                    setFormChanged(true);
                  }}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="staffConsent">Staff Consent Form</label>
                <textarea
                  id="staffConsent"
                  value={staffConsentForm}
                  onChange={(e) => {
                    setStaffConsentForm(e.target.value);
                    setFormChanged(true);
                  }}
                  rows="4"
                />
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={handleUpdateConsentForm}
                  className="save-consent-btn"
                  disabled={saving || !formChanged}
                >
                  {saving ? "Saving..." : "Save Forms"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStudioModal;
