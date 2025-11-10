import React, { useState, useMemo } from "react";
import "./style.css";

const DynamicOptionSelector = ({ combinations, onSelectionChange }) => {
  const [service, setService] = useState("");
  const [subType, setSubType] = useState("");
  const [selectedFlatKey, setSelectedFlatKey] = useState("");

  // ✅ Get all unique service types
  const serviceOptions = useMemo(
    () => [...new Set(combinations.map((c) => c.service))],
    [combinations]
  );

  // ✅ Get subTypes only for tattoo
  const subTypeOptions = useMemo(() => {
    if (service !== "tattoo") return [];
    return [
      ...new Set(
        combinations
          .filter((c) => c.service === service)
          .map((c) => c.subType)
      ),
    ];
  }, [service, combinations]);

  // ✅ Get filtered combinations based on service & subType
  const flatKeyOptions = useMemo(() => {
    if (!service) return [];
    let filtered = combinations.filter((c) => c.service === service);
    if (service === "tattoo" && subType)
      filtered = filtered.filter((c) => c.subType === subType);
    return filtered.map((c) => c.flatKey);
  }, [service, subType, combinations]);

  // ✅ When user selects flatKey
  const handleFlatKeySelect = (key) => {
    setSelectedFlatKey(key);
    onSelectionChange({ service, subType, flatKey: key });
  };

  return (
    <div className="dynamic-selector">
      {/* Service Selector */}
      <div className="selector-group">
        <label>Service</label>
        <div className="btn-row">
          {serviceOptions.map((s) => (
            <button
              key={s}
              className={`btn ${service === s ? "active" : ""}`}
              onClick={() => {
                setService(s);
                setSubType("");
                setSelectedFlatKey("");
                onSelectionChange({ service: s, subType: "", flatKey: "" });
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* SubType (only for tattoo) */}
      {service === "tattoo" && (
        <div className="selector-group">
          <label>Sub Type</label>
          <div className="btn-row">
            {subTypeOptions.map((t) => (
              <button
                key={t}
                className={`btn ${subType === t ? "active" : ""}`}
                onClick={() => {
                  setSubType(t);
                  setSelectedFlatKey("");
                  onSelectionChange({ service, subType: t, flatKey: "" });
                }}
              >
                {t.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FlatKey Selector */}
      {service &&
        ((service === "piercing") || (service === "tattoo" && subType)) &&
        flatKeyOptions.length > 0 && (
          <div className="selector-group">
            <label>
              {service === "tattoo"
                ? "Available Combinations"
                : "Piercing Variants"}
            </label>
            <select
              className="flatkey-select"
              value={selectedFlatKey}
              onChange={(e) => handleFlatKeySelect(e.target.value)}
            >
              <option value="">-- Select a combination --</option>
              {flatKeyOptions.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        )}
    </div>
  );
};

export default DynamicOptionSelector;
