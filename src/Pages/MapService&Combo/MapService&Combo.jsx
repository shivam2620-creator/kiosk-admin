import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import { getAllServiceCombination } from "../../Apis/CompanyAdminApis/CompanyApis";
import DynamicOptionSelector from "../../Component/DynamicOptionSelector/DynamicOptionSelector";
import { mapServiceAndComboApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast"; // ✅ for notifications
import "./style.css";

const MapServiceAndCombo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // ✅ new state
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [combinations, setCombinations] = useState([]);
  const { companyId } = useAuth();
  const [selectedCombo, setSelectedCombo] = useState({});
  const [calendarId, setCalendarId] = useState("");
  const [mappings, setMappings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await getAllServiceCombination();
        if (res?.data?.success) setCombinations(res.data.combinations || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load service combinations");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAddMapping = () => {
    const { service, subType, attributes } = selectedCombo;

    if (!service || !subType)
      return setError("⚠️ Please select a valid combination.");
    if (!calendarId) return setError("⚠️ Please select a calendar.");

    const flatKey = Object.entries(attributes || {})
      .map(([_, v]) => v || "NA")
      .join("_");

    const uniqueKey = `${service}_${subType}_${flatKey}`;

    if (mappings.some((m) => m.flatKey === uniqueKey))
      return setError("❌ This mapping already exists.");

    setMappings([...mappings, { flatKey: uniqueKey, calendarId }]);
    setError("");
  };

  const handleDelete = (flatKey) =>
    setMappings((prev) => prev.filter((m) => m.flatKey !== flatKey));

  const createMapping = async () => {
    if (!selectedStudioId)
      return toast.error("Please select a studio before saving mappings.");
    if (mappings.length === 0)
      return toast.error("No mappings to save. Add at least one.");

    try {
      setSaving(true);
      const res = await mapServiceAndComboApi(companyId, selectedStudioId, {
         mappings,
      });
      console.log(res)

      if (res?.data?.success) {
        toast.success(res.data.message || "Mappings saved successfully!");
        setMappings([]); // clear after save
      } else {
        toast.error(res?.data?.error || "Failed to save mappings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving mappings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="map-service-combo">
      <h2>Map Services & Calendars</h2>

      <StudioSelector
        selectedStudioId={selectedStudioId}
        setSelectedStudioId={setSelectedStudioId}
      />

      {selectedStudioId && (
        <>
          <DynamicOptionSelector
            combinations={combinations}
            onSelectionChange={setSelectedCombo}
          />

          <CalendarSelector
            selectedCalendarId={calendarId}
            setSelectedCalendarId={setCalendarId}
          />

          {error && <p className="error">{error}</p>}

          {calendarId && (
            <button onClick={handleAddMapping} className="add-btn">
              ➕ Add Mapping
            </button>
          )}
        </>
      )}

      {mappings.length > 0 && (
        <div className="mapping-list">
          <h3>Created Mappings</h3>
          {mappings.map((m) => (
            <div key={m.flatKey} className="mapping-item">
              <code>{m.flatKey}</code>
              <FaTrash
                className="delete-icon"
                onClick={() => handleDelete(m.flatKey)}
              />
            </div>
          ))}

          {/* ✅ Save Button */}
          <div className="save-btn-container">
            <button
              onClick={createMapping}
              disabled={saving}
              className="save-btn"
            >
              {saving ? "Saving..." : "Save All Mappings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapServiceAndCombo;
