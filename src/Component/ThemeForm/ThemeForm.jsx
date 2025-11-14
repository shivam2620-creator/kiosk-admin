// src/Pages/UpdateBranding/ThemeForm.jsx
import React, { useState, useEffect, Suspense } from "react";
import updateBrandingApi from "../../Apis/SuperAdminApis/UpdateBrandingApi";
import toast from "react-hot-toast";
import "./style.css";

// lazy import to avoid potential circular import issues at module-eval time
const FontSelector = React.lazy(() => import("../FontSelector/FontSelecotr"));
const LogoUploader = React.lazy(() => import("../LogoUploader/LogoUploader"));

const themeConfiguration = [
  { key: "primaryColor", label: "Primary Color" },
  { key: "secondaryColor", label: "Secondary Color" },
  { key: "background", label: "Background Color" },
  { key: "textColor", label: "Text Color" },
];

const ThemeForm = ({ companyId }) => {
  const [form, setForm] = useState({
    fontFamily: "",
    logoUrl: "",
    primaryColor: "#ecaa20",
    secondaryColor: "#2ecc71",
    background: "#1e1e1e",
    textColor: "#ffffff",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // fetch existing branding here if needed and merge into `form`
    // (not changed for this task)
  }, [companyId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleHexInput = (key, value) => {
    const v = value.trim();
    if (!v) {
      handleChange(key, "");
      return;
    }
    if (v[0] !== "#") handleChange(key, `#${v}`);
    else handleChange(key, v);
  };

  // canSave returns true if ANY field in the form contains a non-empty value
  const canSave = () => {
    return Object.values(form).some((v) => v !== null && v !== undefined && v !== "");
  };

  // build payload using only filled fields (non-empty)
  const buildPayload = () => {
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") {
        payload[k] = v;
      }
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!companyId) return toast.error("No company selected.");
    if (!canSave()) return toast.error("Please fill at least one field before saving.");

    try {
      setSaving(true);
      const payload = buildPayload();

      const res = await updateBrandingApi(companyId, payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Theme updated successfully");
      } else {
        toast.error(res?.data?.message || "Failed to update theme");
      }
    } catch (err) {
      console.error("Theme update error:", err);
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tf-wrap">
      <header className="tf-header">
        <h2 className="tf-title">Theme Configuration</h2>
        <p className="tf-sub">Fonts, logo and color system for this company</p>
      </header>

      <div className="tf-card">
        <div className="tf-grid">
          <div className="tf-col tf-col--form">
            {/* Font selector (lazy) */}
            <div className="tf-field">
              <Suspense fallback={<div style={{ color: "#ccc" }}>Loading font selector…</div>}>
                <FontSelector
                  onSelect={(fonts) =>
                    setForm((prev) => ({ ...prev, fontFamily: fonts }))
                  }
                />
              </Suspense>
              <div className="tf-hint">Selected: {form.fontFamily || "—"}</div>
            </div>

            {/* Logo uploader (lazy) */}
            <div className="tf-field">
              <Suspense fallback={<div style={{ color: "#ccc" }}>Loading logo uploader…</div>}>
                <LogoUploader
                  onUpload={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                />
              </Suspense>
              <div className="tf-hint">Uploaded: {form.logoUrl ? "Yes" : "No"}</div>
            </div>

            {/* Color inputs */}
            <div className="tf-field">
              <label className="tf-label">Theme Colors</label>
              <div className="tf-color-grid">
                {themeConfiguration.map((c) => (
                  <div className="tf-color-item" key={c.key}>
                    <label className="tf-color-label">{c.label}</label>
                    <div className="tf-color-picker">
                      <input
                        type="color"
                        value={form[c.key] || "#000000"}
                        onChange={(e) => handleChange(c.key, e.target.value)}
                        aria-label={c.label}
                      />
                      <input
                        type="text"
                        className="tf-hex-input"
                        placeholder="#ffffff"
                        value={form[c.key] || ""}
                        onChange={(e) => handleHexInput(c.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview: NOTE - fontFamily removed from inline preview (no live font load) */}
          <aside className="tf-col tf-col--preview">
            <div
              className="tf-preview-surface"
              style={{
                background: form.background || "#111",
                color: form.textColor || "#fff",
                // fontFamily intentionally NOT applied here to remove live font preview
              }}
            >
              <div
                className="tf-preview-top"
                style={{ borderBottomColor: form.primaryColor }}
              >
                <div className="tf-logo-wrap">
                  {form.logoUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={form.logoUrl} alt="logo" className="tf-logo" />
                  ) : (
                    <div className="tf-logo-placeholder">Logo</div>
                  )}
                </div>
                <div className="tf-preview-title">Company preview</div>
              </div>

              <div className="tf-preview-body">
                <p className="tf-p">
                  This is a live preview. Primary:{" "}
                  <strong style={{ color: form.primaryColor }}>{form.primaryColor}</strong>
                </p>
              </div>
            </div>

            <div className="tf-preview-meta">
              <div><strong>Primary:</strong> {form.primaryColor}</div>
              <div><strong>Secondary:</strong> {form.secondaryColor}</div>
              <div><strong>Background:</strong> {form.background}</div>
              <div><strong>Text:</strong> {form.textColor}</div>
            </div>
          </aside>
        </div>

        <div className="tf-actions">
          <button
            className="tf-save-btn"
            onClick={handleSubmit}
            disabled={!canSave() || saving}
            aria-disabled={!canSave() || saving}
          >
            {saving ? "Saving…" : "Save Theme"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeForm;
