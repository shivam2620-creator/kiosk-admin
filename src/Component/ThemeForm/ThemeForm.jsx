import { useState } from "react";
import FontSelector from "../FontSelector/FontSelecotr";
import LogoUploader from "../LogoUploader/LogoUploader";
import updateBrandingApi from "../../Apis/SuperAdminApis/UpdateBrandingApi";
import toast from "react-hot-toast";
import "./style.css";

const themeConfigiration = [
  { key: "primaryColor", label: "Primary Color" },
  { key: "secondaryColor", label: "Secondary Color" },
  { key: "background", label: "Background Color" },
  { key: "textColor", label: "Text Color" },
];

const ThemeForm = ({ companyId }) => {
  const [form, setForm] = useState({
    fontFamily: "",
    logoUrl: "",
    primaryColor: "",
    secondaryColor: "",
    background: "",
    textColor: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await updateBrandingApi(companyId, form);
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Theme updated successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update theme.");
    }
  };

  return (
    <div className="theme-form-container">
      <h2>Theme Configuration</h2>

      <FontSelector
        onSelect={(fonts) =>
          setForm((prev) => ({ ...prev, fontFamily: fonts }))
        }
      />

      <LogoUploader
        onUpload={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
      />

      <h3>Theme Colors</h3>

      <div className="theme-color-grid">
        {themeConfigiration.map((item) => (
          <div key={item.key} className="theme-color-item">
            <label>
              <span className="required">*</span> {item.label}
            </label>
            <input
              type="text"
              placeholder="Enter hex code e.g. #ffffff"
              value={form[item.key]}
              onChange={(e) => handleChange(item.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="submit-btn">
        Save Theme
      </button>
    </div>
  );
};

export default ThemeForm;
