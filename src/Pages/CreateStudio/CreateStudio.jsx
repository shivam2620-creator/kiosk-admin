import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import { createStudioApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";
import toast from "react-hot-toast";

const CreateStudio = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    clientConsentForm: "",
    staffConsentForm: "",
  });
 const {user} = useAuth();

  const [defaultCalendarId, setDefaultCalendarId] = useState("");
  const[loading,setLoading] = useState(false);

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.clientConsentForm.trim()&&
    form.staffConsentForm.trim()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     try{
      setLoading(true)
      const response = await createStudioApi(user.companyId,{...form,defaultCalendar: defaultCalendarId})
     
      if(response?.data?.success){
         toast.success(response?.data?.message);
         setDefaultCalendarId("");
         setForm({
    name: "",
    email: "",
    location: "",
    phone: "",
    clientConsentForm: "",
    staffConsentForm: "",
  })

      }
     }catch(err){
         if(err?.response?.data?.success === false){
             toast.error(err?.response?.data?.error)
         }else{
          toast.err('something went wrong try again')
         }
     }finally{
      setLoading(false);
     }
    
  };

  return (
    <div className="create-studio-container">
      <h2>Create Studio</h2>
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
          <CalendarSelector
            selectedCalendarId={defaultCalendarId}
            setSelectedCalendarId={setDefaultCalendarId}
          />
        </div>

        {/* Consent Form Fields */}
        <div className="form-group">
          <label><span className="required">*</span>Client Consent Form:</label>
          <textarea
            name="clientConsentForm"
            value={form.clientConsentForm}
            onChange={handleChange}
            placeholder="Paste client consent form string..."
            rows={4}
          ></textarea>
        </div>

        <div className="form-group">
          <label><span className="required">*</span>Staff Consent Form:</label>
          <textarea
            name="staffConsentForm"
            value={form.staffConsentForm}
            onChange={handleChange}
            placeholder="Paste staff consent form string..."
            rows={4}
          ></textarea>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!isFormValid || loading}
        >
          {loading && <SmallSpinner />}
          {loading ?  "Creating...." : "Create Studio"}
        </button>
      </form>
    </div>
  );
};

export default CreateStudio;
