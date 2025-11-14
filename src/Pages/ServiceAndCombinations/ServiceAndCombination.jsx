import React, { useEffect, useState } from "react";
import "./style.css";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import { checkServiceAndMappingApi, deleteMappingApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import toast from "react-hot-toast";

const ServiceAndCombination = () => {
  const { companyId, isSuperAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(isSuperAdmin ? "" : companyId);
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [mappings, setMappings] = useState([]);
  const [deletingIds, setDeletingIds] = useState({}); // { [flatKey]: boolean }

  // tabs: 'piercing' | 'custom' | 'flash' | 'coverup'
  const [activeServiceTab, setActiveServiceTab] = useState("piercing");
  // filter inside tab: 'all' | 'mapped' | 'unmapped'
  const [activeMapFilter, setActiveMapFilter] = useState("mapped");

  const fetchMappings = async (studioId) => {
    if (!studioId) {
      setMappings([]);
      return;
    }
    try {
      setLoading(true);
      const res = await checkServiceAndMappingApi(studioId);
      if (res?.data?.success) {
        setMappings(Array.isArray(res.data.mappings) ? res.data.mappings : []);
      } else {
        setMappings([]);
        toast.error(res?.data?.message || "Failed to load mappings");
      }
    } catch (err) {
      console.error("fetchMappings error", err);
      setMappings([]);
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudioId) {
      fetchMappings(selectedStudioId);
    } else {
      setMappings([]);
    }
  }, [selectedStudioId]);

  // ---------- deleteMapping: uses deleteMappingApi(studioId, { flatKey }) ----------
  const deleteMapping = async (mapping) => {
    if (!mapping) return;
    const flatKey = mapping.flatKey || mapping.id;
    if (!flatKey) {
      toast.error("Unable to determine mapping key to delete");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this mapping?");
    if (!confirmed) return;

    try {
      setDeletingIds((d) => ({ ...d, [flatKey]: true }));

      const payload = { flatKey };
      const res = await deleteMappingApi(selectedStudioId, payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Mapping deleted");
        await fetchMappings(selectedStudioId);
      } else {
        toast.error(res?.data?.message || "Failed to delete mapping");
      }
    } catch (err) {
      console.error("deleteMapping error", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to delete mapping";
      toast.error(msg);
    } finally {
      setDeletingIds((d) => {
        const copy = { ...d };
        delete copy[flatKey];
        return copy;
      });
    }
  };
  // --------------------------------------------------------------------------------------

  // render attributes as before
  const renderAttributes = (m) => {
    const attrs = m && m.attributes && typeof m.attributes === "object" ? m.attributes : {};
    const service = (m.service || "").toLowerCase();
    const subType = (m.subType || m.sub_type || "").toLowerCase();

    if (service === "piercing") {
      return (
        <>
          <div className="attr-row">
            <div className="attr-label">Sub Type</div>
            <div className="attr-value">{m.subType || m.sub_type || "-"}</div>
          </div>
        </>
      );
    }

    if (service === "tattoo" || service === "ink") {
      if (subType === "custom") {
        return (
          <>
            <div className="attr-row">
              <div className="attr-label">Tattoo Option</div>
              <div className="attr-value">{attrs.tattoo_option || "-"}</div>
            </div>
            <div className="attr-row">
              <div className="attr-label">Size</div>
              <div className="attr-value">{attrs.tattoo_size || "-"}</div>
            </div>
          </>
        );
      } else if (subType === "flash") {
        return (
          <>
            <div className="attr-row">
              <div className="attr-label">Tattoo Name</div>
              <div className="attr-value">{attrs.tattoo_name || "-"}</div>
            </div>
            <div className="attr-row">
              <div className="attr-label">Size</div>
              <div className="attr-value">{attrs.tattoo_size || "-"}</div>
            </div>
            <div className="attr-row">
              <div className="attr-label">Color</div>
              <div className="attr-value">{attrs.tattoo_color || "-"}</div>
            </div>
          </>
        );
      } else if (subType === "coverup_rework") {
        return (
          <>
            <div className="attr-row">
              <div className="attr-label">Placement</div>
              <div className="attr-value">{attrs.tattoo_placement || "-"}</div>
            </div>
            <div className="attr-row">
              <div className="attr-label">Size</div>
              <div className="attr-value">{attrs.tattoo_size || "-"}</div>
            </div>
            <div className="attr-row">
              <div className="attr-label">Color</div>
              <div className="attr-value">{attrs.tattoo_color || "-"}</div>
            </div>
          </>
        );
      } else {
        const keys = Object.keys(attrs);
        if (keys.length === 0) return <div className="attr-row">—</div>;
        return keys.map((k) => (
          <div className="attr-row" key={k}>
            <div className="attr-label">{k}</div>
            <div className="attr-value">{attrs[k] ?? "-"}</div>
          </div>
        ));
      }
    }

    const keys = Object.keys(attrs || {});
    if (keys.length === 0) {
      return <div className="attr-row">—</div>;
    }
    return keys.map((k) => (
      <div className="attr-row" key={k}>
        <div className="attr-label">{k}</div>
        <div className="attr-value">{attrs[k] ?? "-"}</div>
      </div>
    ));
  };

  // --------------------------
  // Filtering helpers
  // --------------------------
  const serviceMatchesTab = (m, tabKey) => {
    const service = (m.service || "").toLowerCase();
    const subType = (m.subType || m.sub_type || "").toLowerCase();

    if (tabKey === "piercing") return service === "piercing";
    if (tabKey === "custom") return (service === "tattoo" || service === "ink") && subType === "custom";
    if (tabKey === "flash") return (service === "tattoo" || service === "ink") && subType === "flash";
    if (tabKey === "coverup") return (service === "tattoo" || service === "ink") && subType === "coverup_rework";
    return false;
  };

  const filteredForActiveTab = mappings.filter((m) => serviceMatchesTab(m, activeServiceTab));

  const filteredByMappedState = filteredForActiveTab.filter((m) => {
    if (activeMapFilter === "all") return true;
    if (activeMapFilter === "mapped") return !!m.isMapped;
    if (activeMapFilter === "unmapped") return !m.isMapped;
    return true;
  });

  // --------------------------
  // UI
  // --------------------------
  const serviceTabs = [
    { key: "piercing", label: "Piercing" },
    { key: "custom", label: "Custom Tattoo" },
    { key: "flash", label: "Flash Tattoo" },
    { key: "coverup", label: "Coverup Tattoo" },
  ];

  return (
    <div className="svc-comb-page">
      <h2>Service & Combination Mapping</h2>

      {/* Superadmin: show company selector first */}
      {isSuperAdmin && (
        <div className="selectors-row">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={(id) => {
              setSelectedCompanyId(id);
              setSelectedStudioId("");
              setMappings([]);
            }}
          />
        </div>
      )}

      {/* Show StudioSelector only when company is selected for superAdmin.
          For regular company admin show StudioSelector immediately. */}
      {(!isSuperAdmin || (isSuperAdmin && selectedCompanyId)) && (
        <div className="selectors-row">
          <StudioSelector
            selectedStudioId={selectedStudioId}
            setSelectedStudioId={(id) => {
              setSelectedStudioId(id);
              setMappings([]);
            }}
            company={isSuperAdmin ? selectedCompanyId : companyId}
          />
        </div>
      )}

      {/* Guidance messages when selection is incomplete */}
      {isSuperAdmin && !selectedCompanyId && (
        <div className="no-mappings" style={{ marginTop: 12 }}>
          Please select a company to continue.
        </div>
      )}

      {!selectedStudioId && ( (!isSuperAdmin && !companyId) || (isSuperAdmin && !selectedCompanyId) ? null : (
        // if company selected (or not superadmin), but studio not selected:
        <div className="no-mappings" style={{ marginTop: 12 }}>
          Please select a studio to view mappings.
        </div>
      ))}

      {/* Only show tabs + mappings when a studio is selected */}
      {selectedStudioId && (
        <>
          {/* Top service tabs */}
          <div className="svc-tabs">
            {serviceTabs.map((t) => (
              <button
                key={t.key}
                className={`svc-tab ${activeServiceTab === t.key ? "active" : ""}`}
                onClick={() => {
                  setActiveServiceTab(t.key);
                  setActiveMapFilter("mapped"); // default to mapped when switching
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* inside-tab filter */}
          <div className="svc-subfilters">
            <button
              className={`subfilter-btn ${activeMapFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveMapFilter("all")}
            >
              All
            </button>
            <button
              className={`subfilter-btn ${activeMapFilter === "mapped" ? "active" : ""}`}
              onClick={() => setActiveMapFilter("mapped")}
            >
              Mapped
            </button>
            <button
              className={`subfilter-btn ${activeMapFilter === "unmapped" ? "active" : ""}`}
              onClick={() => setActiveMapFilter("unmapped")}
            >
              Not mapped
            </button>
          </div>

          <div className="mappings-area">
            {loading ? (
              <div className="center-loader">
                <MediumSpinner />
              </div>
            ) : filteredForActiveTab.length === 0 ? (
              <div className="no-mappings">No mappings found for this category.</div>
            ) : filteredByMappedState.length === 0 ? (
              <div className="no-mappings">No mappings match the selected filter.</div>
            ) : (
              <div className="mappings-grid">
                {filteredByMappedState.map((m) => {
                  const mapped = !!m.isMapped;
                  const borderClass = mapped ? "card-mapped" : "card-unmapped";
                  const flatKey = m.flatKey || m.id;
                  return (
                    <div className={`mapping-card ${borderClass}`} key={flatKey}>
                      <div className="mapping-card-head">
                        <div className="mapping-title">
                          <div className="svc-label">{m.service || "-"}</div>
                          <div className="subtype-label">{m.subType || m.sub_type || "-"}</div>
                        </div>

                        <div className="mapping-badges">
                          <span className={`mapped-badge ${mapped ? "mapped" : "unmapped"}`}>
                            {mapped ? "Mapped" : "Not mapped"}
                          </span>
                        </div>
                      </div>

                      <div className="mapping-body">
                        <div className="attr-row">
                          <div className="attr-label">Calendar</div>
                          <div className="attr-value">{m.calendarId || "-"}</div>
                        </div>

                        <div className="attr-row">
                          <div className="attr-label">Flat Key</div>
                          <div className="attr-value">{flatKey || "-"}</div>
                        </div>

                        <div className="attr-block">{renderAttributes(m)}</div>
                      </div>

                      <div className="mapping-actions">
                        {mapped ? (
                          <button
                            className="delete-btn"
                            onClick={() => deleteMapping(m)}
                            disabled={!!deletingIds[flatKey]}
                          >
                            {deletingIds[flatKey] ? "Deleting..." : "Delete"}
                          </button>
                        ) : (
                          <button className="disabled-btn" disabled>
                            No action
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceAndCombination;
