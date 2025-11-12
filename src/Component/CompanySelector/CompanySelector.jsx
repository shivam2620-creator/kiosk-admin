import React, { useEffect, useState, useRef } from "react";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import "./style.css";

const CompanySelector = ({ selectedCompanyId, setSelectedCompanyId }) => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ added
  const dropdownRef = useRef(null);

  // ✅ Fetch companies on mount or when dropdown opens
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!dropdownOpen) return;
      try {
        setLoading(true);
        const response = await getAllCompanyApi();
        setCompanies(response?.data?.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [dropdownOpen]);

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

  // ✅ Filter companies by search term
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (company) => {
    setSelectedCompanyId(company.id);
    setDropdownOpen(false);
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="company-selector-wrapper" ref={dropdownRef}>
      <label className="company-selector-label">Select Company:</label>

      <div
        className={`company-dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCompany ? selectedCompany.name : "Choose a company"}
        <span className="company-dropdown-arrow">
          {dropdownOpen ? "▲" : "▼"}
        </span>
      </div>

      {dropdownOpen && (
        <div className="company-dropdown-menu">
          {/* ✅ Show spinner while loading */}
          {loading ? (
            <div className="company-loading">
              <SmallSpinner />
              <p>Loading companies...</p>
            </div>
          ) : (
            <>
              <input
                type="text"
                className="company-dropdown-search"
                placeholder="Search company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="company-dropdown-list">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className={`company-dropdown-item ${
                        selectedCompanyId === company.id ? "selected" : ""
                      }`}
                      onClick={() => handleSelect(company)}
                    >
                      <div className="company-item-name">{company.name}</div>
                      <div className="company-item-email">{company.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="company-no-results">No companies found</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
