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
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import "./style.css";

const MapServiceAndCombo = () => {
  const [loading, setLoading] = useState(false); // initial data load
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

  const activeCompanyId = isSuperAdmin ? selectedCompanyId : companyId;

  // fetch mapping status for selected studio
  const checkMappingStatus = async (studio) => {
    if (!studio) return;
    try {
      const res = await checkServiceAndMappingApi(studio);
      if (res?.data?.success) {
        setMappinCheckingData(res.data.mappings || []);
      } else {
        setMappinCheckingData([]);
      }
    } catch (err) {
      console.error("checkMappingStatus:", err);
      setMappinCheckingData([]);
    }
  };

  // remove mapping from server for selected combo
  const removeMapping = async () => {
    if (!selectedCombo?.flatKey)
      return toast.error("Please select a combination first.");

    if (!selectedStudioId) return toast.error("Select a studio.");

    try {
      setDeleting(true);
      const res = await removeServiceMappingApi(selectedStudioId, {
        flatKey: selectedCombo.flatKey,
      });

      if (res?.data?.success) {
        toast.success(res.data.message || "Mapping removed successfully!");
        await checkMappingStatus(selectedStudioId);
      } else {
        toast.error(res?.data?.error || "Failed to remove mapping.");
      }
    } catch (err) {
      console.error("removeMapping:", err);
      toast.error("Error removing mapping.");
    } finally {
      setDeleting(false);
    }
  };

  // initial load of available combinations
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await getAllServiceCombination();
        if (!mounted) return;
        if (res?.data?.success) setCombinations(res.data.combinations || []);
        else setCombinations([]);
      } catch (err) {
        console.error("getAllServiceCombination:", err);
        toast.error("Failed to load service combinations");
        setCombinations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // whenever studio changes, refresh mapping status and reset small UI state
  useEffect(() => {
    setMappings([]);
    setSelectedCombo({});
    setCalendarId("");
    setError("");
    if (selectedStudioId) checkMappingStatus(selectedStudioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudioId]);

  // builds a stable combo key if server didn't provide flatKey
  const buildComboKey = (combo) => {
    if (!combo) return null;
    const comboKeyFromApi = combo.flatKey || combo.flat_key || combo.flat || null;
    if (comboKeyFromApi) return comboKeyFromApi;

    const service = combo.service || "service";
    const subType = combo.subType || combo.sub_type || "type";
    const attrs = combo.attributes || {};
    const sorted = Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b));
    const attrString = sorted.length
      ? sorted.map(([k, v]) => `${k}:${v ?? "NA"}`).join("|")
      : "NO_ATTRS";
    return `${service}__${subType}__${attrString}`;
  };

  const handleAddMapping = () => {
    setError("");
    const combo = selectedCombo || {};
    if (!combo || Object.keys(combo).length === 0) {
      return setError("⚠️ Please select a combination.");
    }

    if (!calendarId) return setError("⚠️ Please select a calendar.");

    const comboKey = buildComboKey(combo);
    if (!comboKey) return setError("⚠️ Invalid combination selected.");

    const existingMapping = mappingCheckingData.find((m) => m.flatKey === comboKey);

    if (existingMapping && existingMapping.isMapped) {
      toast.error("This combination is already mapped (server).");
      return;
    }

    if (mappings.some((m) => m.key === comboKey)) {
      return setError("❌ This mapping is already added locally.");
    }

    const newMapping = {
      key: comboKey,
      flatKey: comboKey,
      calendarId,
      label: combo.label || comboKey,
    };

    setMappings((prev) => [...prev, newMapping]);
    setError("");
  };

  const handleDelete = (key) => setMappings((prev) => prev.filter((m) => m.key !== key));

  const createMapping = async () => {
    if (!selectedStudioId) return toast.error("Please select a studio before saving mappings.");
    if (mappings.length === 0) return toast.error("No mappings to save. Add at least one.");
    if (!activeCompanyId) return toast.error("Please select a company first.");

    try {
      setSaving(true);
      const res = await mapServiceAndComboApi(activeCompanyId, selectedStudioId, { mappings });
      if (res?.data?.success) {
        toast.success(res.data.message || "Mappings saved successfully!");
        setMappings([]);
        setCalendarId("");
        await checkMappingStatus(selectedStudioId);
      } 
    } catch (err) {
  
   
      toast.error(err.response?.data?.error || "Failed to save mappings.");

    } finally {
      setSaving(false);
    }
  };

  const isAlreadyMapped =
    selectedCombo?.flatKey &&
    mappingCheckingData.some((m) => m.flatKey === selectedCombo.flatKey && m.isMapped);

  const showCompanySelector = isSuperAdmin;
  const showStudioSection = (!isSuperAdmin && companyId) || (isSuperAdmin && selectedCompanyId);

  return (
    <div className="msc-wrap">
      <header className="msc-header">
        <h2 className="msc-title">Map Services & Calendars</h2>
        <p className="msc-sub">Create mappings between service/combo → calendar for a studio.</p>
      </header>

      {loading ? (
        <div className="msc-loading">
          <MediumSpinner />
          <div className="msc-loading-text">Loading combinations…</div>
        </div>
      ) : (
        <>
          {/* Company selector */}
          {showCompanySelector && (
            <div className="msc-row">
              
              <div className="msc-company-row">
                <CompanySelector
                  selectedCompanyId={selectedCompanyId}
                  setSelectedCompanyId={setSelectedCompanyId}
                />
              </div>
            </div>
          )}

          {/* Studio selector (shows only after company available) */}
          {showStudioSection ? (
            <>
              <div className="msc-row">
              
                <div className="msc-studio-row">
                  <StudioSelector
                    selectedStudioId={selectedStudioId}
                    setSelectedStudioId={setSelectedStudioId}
                    company={activeCompanyId}
                  />
                </div>
              </div>

              {/* when a studio is selected show combination selector + calendar selector */}
              {selectedStudioId && (
                <>
                  <div className="msc-row">
                    <label className="msc-label">Choose Combination</label>
                    <DynamicOptionSelector
                      combinations={combinations}
                      onSelectionChange={setSelectedCombo}
                    />
                  </div>

                  {isAlreadyMapped && (
                    <div className="msc-row">
                      <div className="msc-warning">This combination is already mapped</div>
                      <button
                        className="msc-btn msc-edit-mapping"
                        onClick={removeMapping}
                        disabled={deleting}
                      >
                        {deleting ? "Removing…" : "Remove Mapping"}
                      </button>
                    </div>
                  )}

                  <div className="msc-row">
                    <label className="msc-label">Select Calendar</label>
                    <CalendarSelector
                      selectedCalendarId={calendarId}
                      setSelectedCalendarId={setCalendarId}
                      studioId={selectedStudioId}
                      company={activeCompanyId}
                    />
                  </div>

                  {error && (
                    <div className="msc-row">
                      <div className="msc-error">{error}</div>
                    </div>
                  )}

                  <div className="msc-row">
                    <div className="msc-actions-left">
                      <button
                        className="msc-btn msc-add-btn"
                        onClick={handleAddMapping}
                      >
                        Add Mapping
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Local mappings preview */}
              {mappings.length > 0 && (
                <div className="msc-mapping-list">
                  <h3 className="msc-mapping-title">Created Mappings</h3>
                  <div className="msc-mapping-items">
                    {mappings.map((m) => (
                      <div key={m.key} className="msc-mapping-item">
                        <div className="msc-mapping-left">
                          <div className="msc-mapping-label">{m.label || m.flatKey}</div>
                          <div className="msc-mapping-meta">Calendar: {m.calendarId}</div>
                        </div>
                        <div className="msc-mapping-actions">
                          <button
                            className="msc-icon-btn"
                            onClick={() => handleDelete(m.key)}
                            title="Remove mapping"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="msc-save-row">
                    <button
                      className="msc-btn msc-save-btn"
                      onClick={createMapping}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save All Mappings"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            showCompanySelector && (
              <div className="msc-hint">Please select a company to continue.</div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default MapServiceAndCombo;
