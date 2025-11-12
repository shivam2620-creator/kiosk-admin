import React, { useEffect, useState } from "react";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { getAllCalenderApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import { CalendarCheck, Layers } from "lucide-react";
import "./style.css";

const AllCalendar = () => {
  const { companyId, isSuperAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // ✅ Fetch all calendar data
  const fetchAllCalendars = async (targetCompanyId) => {
    try {
      if (!targetCompanyId) return;
      setLoading(true);
      const res = await getAllCalenderApi(targetCompanyId);
      setCalendars(res?.data?.calendars || []);
    } catch (err) {
      console.error("Error fetching calendars:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fetch for Company Admin
  useEffect(() => {
    if (!isSuperAdmin && companyId) {
      fetchAllCalendars(companyId);
    }
  }, [companyId, isSuperAdmin]);

  // ✅ Manual fetch for Super Admin (after company selection)
  useEffect(() => {
    if (isSuperAdmin && selectedCompanyId) {
      fetchAllCalendars(selectedCompanyId);
    }
  }, [selectedCompanyId, isSuperAdmin]);

  // ✅ Filter logic
  const filteredCalendars =
    activeTab === "mapped"
      ? calendars.filter((c) => c.isMapped)
      : calendars;

  // ✅ Pagination
  const totalPages = Math.ceil(filteredCalendars.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredCalendars.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="calendar-dashboard-loading">
        <MediumSpinner />
        <p>Loading Calendars...</p>
      </div>
    );
  }

  return (
    <div className="calendar-dashboard-section">
      {/* Header */}
      <div className="calendar-dashboard-header">
        <div className="calendar-dashboard-title-wrap">
          <div className="calendar-dashboard-icon-circle">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="calendar-dashboard-title">All Calendars</h2>
            <p className="calendar-dashboard-subtitle">
              Manage, filter, and view all calendars mapped to studios.
            </p>
          </div>
        </div>
      </div>

      {/* Company Selector (Super Admin) */}
      {isSuperAdmin && (
        <div className="calendar-dashboard-company">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* Show content only after company selection */}
      {(selectedCompanyId || !isSuperAdmin) && (
        <>
          {/* Tabs */}
          <div className="calendar-dashboard-tabs">
            <button
              className={`calendar-dashboard-tab-btn ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
            >
              <CalendarCheck size={16} />
              All Calendars
            </button>
            <button
              className={`calendar-dashboard-tab-btn ${
                activeTab === "mapped" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("mapped");
                setCurrentPage(1);
              }}
            >
              <Layers size={16} />
              Mapped Calendars
            </button>
          </div>

          {/* Table */}
          <div className="calendar-dashboard-table-card">
            {currentData.length === 0 ? (
              <p className="calendar-dashboard-no-data">No calendars found.</p>
            ) : (
              <table className="calendar-dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Studio ID</th>
                    <th>Mapped</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((cal, index) => (
                    <tr key={index}>
                      <td className="calendar-dashboard-name" title={cal.name}>
                        {cal.name}
                      </td>
                      <td>{cal.calendarType || "-"}</td>
                      <td>{cal.studioId || "-"}</td>
                      <td>
                        <span
                          className={`calendar-dashboard-status ${
                            cal.isMapped
                              ? "calendar-dashboard-status-mapped"
                              : "calendar-dashboard-status-unmapped"
                          }`}
                        >
                          {cal.isMapped ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="calendar-dashboard-pagination-wrapper">
              <div className="calendar-dashboard-pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀ Prev
                </button>
                <span>
                  Page <strong>{currentPage}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next ▶
                </button>
              </div>

              {/* Rows per page */}
              <div className="calendar-dashboard-rows-selector">
                <label>Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={filteredCalendars.length}>All</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {isSuperAdmin && !selectedCompanyId && (
        <p className="calendar-dashboard-no-data">
          Please select a company to view calendars.
        </p>
      )}
    </div>
  );
};

export default AllCalendar;
