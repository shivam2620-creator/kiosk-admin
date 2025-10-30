import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import "react-phone-input-2/lib/style.css";
import "./style.css";

const CreateStudio = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
  });
  
  const [companies,setCompanies] = useState([])


  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.location.trim() &&
    form.phone.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Studio Data:", form);
    // You can call your API here
  };



  return (
    <div className="create-studio-container">
      <h2>Create Studio</h2>
      <form className="create-studio-form" onSubmit={handleSubmit}>
        {/* Studio Name */}
        <div className="form-group">
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

        {/* Email */}
        <div className="form-group">
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

        {/* Location */}
        <div className="form-group">
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

        {/* Phone */}
        <div className="form-group">
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

        <button
          type="submit"
          className="submit-btn"
          disabled={!isFormValid}
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateStudio;
