import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import { getAllServiceCombination } from "../../Apis/CompanyAdminApis/CompanyApis";
import DynamicOptionSelector from "../../Component/DynamicOptionSelector/DynamicOptionSelector";
import { removeMappedUserApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { removeServiceMappingApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import {
  checkServiceAndMappingApi,
  mapServiceAndComboApi,
} from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";
import "./style.css";

const MapServiceAndCombo = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [combinations, setCombinations] = useState([]);
  const { companyId } = useAuth();
  const [selectedCombo, setSelectedCombo] = useState({});
  const [calendarId, setCalendarId] = useState("FN6xZNwzren3122Bq1JI");
  const [mappings, setMappings] = useState([]);
  const [error, setError] = useState("");
  const [mappingCheckingData, setMappinCheckingData] = useState([]);

  // ✅ Fetch mapping status for selected studio
  const checkMappingStatus = async () => {
    try {
      const res = await checkServiceAndMappingApi(selectedStudioId);
      if (res.data.success) {
        setMappinCheckingData(res.data.mappings);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Remove existing mapping
  const removeMapping = async () => {
    if (!selectedCombo?.flatKey)
      return toast.error("Please select a combination first.");

    try {
      setDeleting(true);
      const res = await removeServiceMappingApi(selectedStudioId, {
        flatKey: selectedCombo.flatKey,
      });
   console.log(res)
      if (res?.data?.success) {
        toast.success(res.data.message || "Mapping removed successfully!");
        await checkMappingStatus(); // refresh mapping data
      } else {
        toast.error(res?.data?.error || "Failed to remove mapping.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error removing mapping.");
    } finally {
      setDeleting(false);
    }
  };

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

    if (selectedStudioId) {
      checkMappingStatus();
    }

    fetchAll();
  }, [selectedStudioId]);

  // ✅ Handle Add Mapping
  const handleAddMapping = () => {
    const combo = selectedCombo || {};
    const { service, subType } = combo;

    if (!calendarId) return setError("⚠️ Please select a calendar.");

    // Determine unique flatKey
    const comboKeyFromApi =
      combo.flatKey || combo.flat_key || combo.flat || null;
    let comboKey;
    if (comboKeyFromApi) {
      comboKey = comboKeyFromApi;
    } else {
      const attrs = combo.attributes || {};
      const sorted = Object.entries(attrs).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const attrString = sorted.length
        ? sorted.map(([k, v]) => `${k}:${v ?? "NA"}`).join("|")
        : "NO_ATTRS";
      comboKey = `${service}__${subType}__${attrString}`;
    }

    // ✅ 1. Check if combo already exists in saved mappingCheckingData
    const existingMapping = mappingCheckingData.find(
      (m) => m.flatKey === comboKey
    );

    if (existingMapping && existingMapping.isMapped) {
      // 🔸 Already mapped — don’t add, show warning
      setError("");
      toast.error("This combination is already mapped.");
      return;
    }

    // ✅ 2. Check if it's already in current pending mappings
    if (mappings.some((m) => m.key === comboKey)) {
      return setError("❌ This mapping already exists.");
    }

    const newMapping = {
      key: comboKey,
      flatKey: comboKey,
      calendarId,
    };

    setMappings((prev) => [...prev, newMapping]);
    setError("");
  };

  const handleDelete = (key) =>
    setMappings((prev) => prev.filter((m) => m.key !== key));

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

      if (res?.data?.success) {
        toast.success(res.data.message || "Mappings saved successfully!");
        setMappings([]); // clear after save
        await checkMappingStatus(); // refresh
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

  // ✅ Check if selected combo is already mapped
  const isAlreadyMapped =
    selectedCombo?.flatKey &&
    mappingCheckingData.some(
      (m) => m.flatKey === selectedCombo.flatKey && m.isMapped
    );

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

          {/* 🔴 Already mapped warning & remove button */}
          {isAlreadyMapped && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div className="already-mapped-warning">
                This combination is already mapped
              </div>

              <button
                onClick={removeMapping}
                className="edit-mapping-btn"
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Remove Mapping"}
              </button>
            </div>
          )}

          <CalendarSelector
            selectedCalendarId={calendarId}
            setSelectedCalendarId={setCalendarId}
            studioId={selectedStudioId}
          />

          {error && <p className="error">{error}</p>}

          {calendarId && !isAlreadyMapped && (
            <button onClick={handleAddMapping} className="add-btn">
              Add Mapping
            </button>
          )}
        </>
      )}

      {mappings.length > 0 && (
        <div className="mapping-list">
          <h3>Created Mappings</h3>
          {mappings.map((m) => (
            <div key={m.key} className="mapping-item">
              <code>{m.flatKey}</code>
              <FaTrash
                className="delete-icon"
                onClick={() => handleDelete(m.key)}
              />
            </div>
          ))}

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
