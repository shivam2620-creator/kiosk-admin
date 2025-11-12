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
    <div className="create-studio-container">
      <h2>Create Studio</h2>

      {/* ===== SuperAdmin: Company Selector ===== */}
      {isSuperAdmin && (
        <div className="form-group">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* ✅ Only show form if:
          - Company admin (auto companyId)
          - OR super admin has selected a company
      */}
      {selectedCompanyId ? (
        <form className="create-studio-form" onSubmit={handleSubmit}>
          {/* Row 1: Name + Email */}
          <div className="form-row">
            <div className="form-group half">
              <label>
                <span className="required">*</span> Name:
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter studio name"
              />
            </div>

            <div className="form-group half">
              <label>
                <span className="required">*</span> Email:
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Row 2: Phone + Location */}
          <div className="form-row">
            <div className="form-group half">
              <label>
                <span className="required">*</span> Phone:
              </label>
              <PhoneInput
                country={"in"}
                value={form.phone}
                onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
                inputClass="phone-input"
              />
            </div>

            <div className="form-group half">
              <label>
                <span className="required">*</span> Location:
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Calendar Selector */}
          <div className="form-group">
            <div className="calendar-select-row">
              <CalendarSelector
                selectedCalendarId={selectedCalendarId}
                setSelectedCalendarId={setSelectedCalendarId}
                company={selectedCompanyId}
              />
              <button
                type="button"
                onClick={handleAddCalendar}
                className="add-calendar-btn"
              >
                Add
              </button>
            </div>
          </div>

          {/* Show selected calendars */}
          {form.calendars.length > 0 && (
            <div className="selected-calendars">
              <h4>Selected Calendars</h4>
              <ul>
                {form.calendars.map((cal) => (
                  <li key={cal} className="calendar-item">
                    <span>
                      {cal}
                      {cal === defaultCalendarId && (
                        <span className="default-badge">Default</span>
                      )}
                    </span>
                    <div>
                      {cal !== defaultCalendarId && (
                        <button
                          type="button"
                          className="make-default-btn"
                          onClick={() => setDefaultCalendarId(cal)}
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="remove-calendar-btn"
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

          {/* Consent Forms */}
          <div className="form-group">
            <label>
              <span className="required">*</span> Client Consent Form:
            </label>
            <textarea
              name="clientConsentForm"
              value={form.clientConsentForm}
              onChange={handleChange}
              placeholder="Paste client consent form HTML/string..."
              rows={4}
            ></textarea>
          </div>

          <div className="form-group">
            <label>
              <span className="required">*</span> Staff Consent Form:
            </label>
            <textarea
              name="staffConsentForm"
              value={form.staffConsentForm}
              onChange={handleChange}
              placeholder="Paste staff consent form HTML/string..."
              rows={4}
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid || loading}
          >
            {loading && <SmallSpinner />}
            {loading ? "Creating..." : "Create Studio"}
          </button>
        </form>
      ) : (
        isSuperAdmin && (
          <p className="info-text">👆 Please select a company to continue.</p>
        )
      )}
    </div>
  );
};

export default CreateStudio;
