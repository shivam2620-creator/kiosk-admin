import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import CalendarSelector from "../../Component/CalendarSelector/CalendarSelector";
import { getAllServiceCombination } from "../../Apis/CompanyAdminApis/CompanyApis";
import DynamicOptionSelector from "../../Component/DynamicOptionSelector/DynamicOptionSelector";
import { removeServiceMappingApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
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
  const [selectedCombo, setSelectedCombo] = useState({});
  const [calendarId, setCalendarId] = useState("");
  const [mappings, setMappings] = useState([]);
  const [error, setError] = useState("");
  const [mappingCheckingData, setMappinCheckingData] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const { companyId, isSuperAdmin } = useAuth();

  // ✅ Determine active company (for API calls)
  const activeCompanyId = isSuperAdmin ? selectedCompanyId : companyId;
  

  // ✅ Fetch mapping status for selected studio
  const checkMappingStatus = async () => {
    if (!selectedStudioId) return;
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

      if (res?.data?.success) {
        toast.success(res.data.message || "Mapping removed successfully!");
        await checkMappingStatus();
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

    if (selectedStudioId) checkMappingStatus();
    fetchAll();
  }, [selectedStudioId]);

  // ✅ Handle Add Mapping
  const handleAddMapping = () => {
    const combo = selectedCombo || {};
    const { service, subType } = combo;

    if (!calendarId) return setError("⚠️ Please select a calendar.");

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

    const existingMapping = mappingCheckingData.find(
      (m) => m.flatKey === comboKey
    );

    if (existingMapping && existingMapping.isMapped) {
      toast.error("This combination is already mapped.");
      return;
    }

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
    if (!activeCompanyId)
      return toast.error("Please select a company first.");

    try {
      setSaving(true);
      const res = await mapServiceAndComboApi(
        activeCompanyId,
        selectedStudioId,
        { mappings }
      );

      if (res?.data?.success) {
        toast.success(res.data.message || "Mappings saved successfully!");
        setMappings([]);
        await checkMappingStatus();
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

  const isAlreadyMapped =
    selectedCombo?.flatKey &&
    mappingCheckingData.some(
      (m) => m.flatKey === selectedCombo.flatKey && m.isMapped
    );

  // ✅ Control what’s shown
  const showCompanySelector = isSuperAdmin;
  const showStudioSection =
    (!isSuperAdmin && companyId) || (isSuperAdmin && selectedCompanyId);

  return (
    <div className="map-service-combo">
      <h2>Map Services & Calendars</h2>

      {/* ✅ Show company selector only for super admin */}
      {showCompanySelector && (
        <div className="form-section">
          <label>Select Company</label>
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* ✅ Show the rest only after company selected */}
      {showStudioSection && (
        <>
          <StudioSelector
            selectedStudioId={selectedStudioId}
            setSelectedStudioId={setSelectedStudioId}
            company={activeCompanyId}
          />

          {selectedStudioId && (
            <>
              <DynamicOptionSelector
                combinations={combinations}
                onSelectionChange={setSelectedCombo}
              />

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
                company={activeCompanyId}
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
        </>
      )}

      {/* Optional hint for super admin */}
      {isSuperAdmin && !selectedCompanyId && (
        <p className="hint-text">Please select a company to continue.</p>
      )}
    </div>
  );
};

export default MapServiceAndCombo;
