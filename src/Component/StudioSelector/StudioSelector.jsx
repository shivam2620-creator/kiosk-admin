import React, { useEffect, useState, useRef } from "react";
import { getAllStudiosApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import { useAuth } from "../../Utils/AuthContext";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";

const StudioSelector = ({ selectedStudioId, setSelectedStudioId,company}) => {
  const [studios, setStudios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const { user , isSuperAdmin,companyId } = useAuth();
 

  useEffect(() => {
    const fetchAllStudio = async () => {

      setLoading(true);
      try {
        const response = await getAllStudiosApi(isSuperAdmin ? company :companyId);
        if (response?.data?.success) {
          setStudios(response.data.studios || []);
        } else {
          console.warn("No studios found:", response?.data);
        }
      } catch (err) {
        console.error("Error fetching studios:", err);
      } finally {
        setLoading(false);
      }
    };
    if(company || companyId ){
 fetchAllStudio();
    }
   
  }, [companyId,company]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter studios by search term
  const filteredStudios = studios.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (studio) => {
    setSelectedStudioId(studio.id);
    setDropdownOpen(false);
  };

  const selectedStudio = studios.find((s) => s.id === selectedStudioId);
  console.log("selected studio", selectedStudio)
  

  return (
    <div className="studio-selector" ref={dropdownRef}>
      <label className="studio-label">Select Studio:</label>

      <div
        className={`studio-dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedStudio
          ? `${selectedStudio.name} (${selectedStudio.location})`
          : "Choose a studio"}
        <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {dropdownOpen && (
        <div className="studio-dropdown-menu">
          <input
            type="text"
            className="studio-dropdown-search"
            placeholder="Search studio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="studio-dropdown-list">
            {loading ? (
              <div className="loading"><SmallSpinner /></div>
            ) : filteredStudios.length > 0 ? (
              filteredStudios.map((studio) => (
                <div
                  key={studio.id}
                  className={`studio-dropdown-item ${
                    selectedStudioId === studio.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(studio)}
                >
                  <div className="studio-name">{studio.name}</div>
                  <div className="studio-location">Location: {studio.location}</div>
                </div>
              ))
            ) : (
              <div className="no-results">No studios found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioSelector;
