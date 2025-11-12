import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import { createStudioApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import toast from "react-hot-toast";
import "./style.css";

const CreateStudio = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    clientConsentForm: "",
    staffConsentForm: "",
    calendars: [],
  });

  const { user, isSuperAdmin } = useAuth();

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedCalendarId, setSelectedCalendarId] = useState("");
  const [defaultCalendarId, setDefaultCalendarId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-assign companyId if company admin
  useEffect(() => {
    if (!isSuperAdmin && user?.companyId) {
      setSelectedCompanyId(user.companyId);
    }
  }, [isSuperAdmin, user]);

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.clientConsentForm.trim() &&
    form.staffConsentForm.trim() &&
    form.calendars.length > 0 &&
    defaultCalendarId.trim() &&
    selectedCompanyId.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCalendar = () => {
    if (!selectedCalendarId)
      return toast.error("Please select a calendar first.");
    if (form.calendars.includes(selectedCalendarId))
      return toast.error("This calendar is already added.");

    setForm((prev) => ({
      ...prev,
      calendars: [...prev.calendars, selectedCalendarId],
    }));

    // ✅ Automatically set the first added calendar as default
    if (!defaultCalendarId) {
      setDefaultCalendarId(selectedCalendarId);
    }

    setSelectedCalendarId("");
  };

  const handleRemoveCalendar = (id) => {
    if (id === defaultCalendarId)
      return toast.error("You cannot remove the default calendar.");
    setForm((prev) => ({
      ...prev,
      calendars: prev.calendars.filter((c) => c !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompanyId)
      return toast.error("Please select a company before submitting.");

    try {
      setLoading(true);
      const payload = {
        ...form,
        defaultCalendar: defaultCalendarId,
      };

      const response = await createStudioApi(selectedCompanyId, payload);

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Studio created successfully!");
        // Reset form
        setForm({
          name: "",
          email: "",
          location: "",
          phone: "",
          clientConsentForm: "",
          staffConsentForm: "",
          calendars: [],
        });
        setDefaultCalendarId("");
        setSelectedCalendarId("");
        if (isSuperAdmin) setSelectedCompanyId("");
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.error) toast.error(err.response.data.error);
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-page-wrap">
      <div className="cs-card">
        <header className="cs-card-header">
          <h2>Create Studio</h2>
          <p className="cs-card-sub">Create a new studio and configure calendars & consent forms.</p>
        </header>

        <div className="cs-card-body">
          {/* SuperAdmin: Company Selector */}
          {isSuperAdmin && (
            <div className="cs-row cs-company-row">
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </div>
          )}

          {isSuperAdmin && !selectedCompanyId && (
            <div className="cs-info">👆 Please select a company to continue.</div>
          )}

          {(!isSuperAdmin || selectedCompanyId) && (
            <form className="cs-form" onSubmit={handleSubmit}>
              {/* top input row (2 columns, expand to fill) */}
              <div className="cs-row cs-top-row">
                <div className="cs-col cs-col--grow">
                  <label className="cs-label"><span className="cs-required">*</span> Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Studio name"
                  />
                </div>

                <div className="cs-col cs-col--grow">
                  <label className="cs-label"><span className="cs-required">*</span> Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="studio@example.com"
                  />
                </div>
              </div>

              {/* phone + location on same row */}
              <div className="cs-row cs-top-row">
                <div className="cs-col cs-col--grow">
                  <label className="cs-label"><span className="cs-required">*</span> Phone</label>
                  <PhoneInput
                    country={"in"}
                    value={form.phone}
                    onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
                    inputClass="cs-phone-input"
                    containerClass="cs-phone-container"
                    inputProps={{ "aria-label": "phone" }}
                  />
                </div>

                <div className="cs-col cs-col--grow">
                  <label className="cs-label"><span className="cs-required">*</span> Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, state or full address"
                  />
                </div>
              </div>

              {/* calendar selector row */}
              <div className="cs-row cs-calendar-row">
                <div className="cs-col cs-col--grow">
                  <CalendarSelector
                    selectedCalendarId={selectedCalendarId}
                    setSelectedCalendarId={setSelectedCalendarId}
                    company={selectedCompanyId}
                  />
                </div>
                <div className="cs-col cs-col--auto">
                  <button type="button" className="cs-btn cs-add" onClick={handleAddCalendar}>
                    Add
                  </button>
                </div>
              </div>

              {/* selected calendars */}
              {form.calendars.length > 0 && (
                <div className="cs-selected-wrap">
                  <h4>Selected Calendars</h4>
                  <ul className="cs-calendar-list">
                    {form.calendars.map((cal) => (
                      <li key={cal} className="cs-calendar-item">
                        <div className="cs-calendar-left">
                          <span className="cs-calendar-name">{cal}</span>
                          {cal === defaultCalendarId && <span className="cs-default">Default</span>}
                        </div>
                        <div className="cs-calendar-actions">
                          {cal !== defaultCalendarId && (
                            <button
                              type="button"
                              className="cs-btn cs-small cs-default-btn"
                              onClick={() => setDefaultCalendarId(cal)}
                            >
                              Make default
                            </button>
                          )}
                          <button
                            type="button"
                            className="cs-btn cs-small cs-remove-btn"
                            onClick={() => handleRemoveCalendar(cal)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* consent forms */}
              <div className="cs-row">
                <div className="cs-col cs-col--full">
                  <label className="cs-label"><span className="cs-required">*</span> Client Consent Form</label>
                  <textarea
                    name="clientConsentForm"
                    value={form.clientConsentForm}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Paste HTML/text for client consent..."
                  />
                </div>
              </div>

              <div className="cs-row">
                <div className="cs-col cs-col--full">
                  <label className="cs-label"><span className="cs-required">*</span> Staff Consent Form</label>
                  <textarea
                    name="staffConsentForm"
                    value={form.staffConsentForm}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Paste HTML/text for staff consent..."
                  />
                </div>
              </div>

              <div className="cs-actions">
                <button type="submit" className="cs-btn cs-submit" disabled={!isFormValid || loading}>
                  {loading ? <SmallSpinner /> : "Create Studio"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStudio;
