import React, { useEffect, useState, useRef } from "react";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import "./style.css";

const CompanySelector = ({ selectedCompanyId, setSelectedCompanyId }) => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getAllCompanyApi();
        setCompanies(response?.data?.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

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

  // ✅ Filter companies by search
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (company) => {
    setSelectedCompanyId(company.id);
    setDropdownOpen(false);
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="company-selector" ref={dropdownRef}>
      <label className="company-label">Select Company:</label>

      <div
        className={`dropdown-input ${dropdownOpen ? "active" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCompany ? selectedCompany.name : "Choose a company"}
        <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {dropdownOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            className="dropdown-search"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="dropdown-list">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`dropdown-item ${
                    selectedCompanyId === company.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(company)}
                >
                  <div className="company-name">{company.name}</div>
                  <div className="company-email">{company.email}</div>
                </div>
              ))
            ) : (
              <div className="no-results">No companies found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
