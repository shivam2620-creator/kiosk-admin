import React, { useEffect, useState } from "react";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { getAllCalenderApi } from "../../Apis/CompanyAdminApis/CompanyApis";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import "./style.css";

const AllCalendar = () => {
  const { companyId, isSuperAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // ✅ Filter based on tab
  const filteredCalendars =
    activeTab === "mapped"
      ? calendars.filter((c) => c.isMapped)
      : calendars;

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredCalendars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCalendars.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="calendar-loading">
        <MediumSpinner />
        <p>Loading Calendars...</p>
      </div>
    );
  }

  return (
    <div className="all-calendar-container">
      <h2>All Calendars</h2>

      {/* ✅ Show Company Selector if Super Admin */}
      {isSuperAdmin && (
        <div style={{ width: "40%", margin: "0 auto 20px auto" }}>
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* ✅ Only show tabs and table after selecting a company (for Super Admin) */}
      {(!isSuperAdmin || selectedCompanyId) && (
        <>
          {/* Tabs */}
          <div className="calendar-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
            >
              All Calendars
            </button>
            <button
              className={`tab-btn ${activeTab === "mapped" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("mapped");
                setCurrentPage(1);
              }}
            >
              Mapped Calendars
            </button>
          </div>

          {/* Table */}
          <div className="calendar-table-wrapper">
            {currentData.length === 0 ? (
              <p className="no-data">No calendars found.</p>
            ) : (
              <table className="calendar-table">
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
                      <td className="calendar-name" title={cal.name}>
                        {cal.name}
                      </td>
                      <td>{cal.calendarType || "-"}</td>
                      <td>{cal.studioId || "-"}</td>
                      <td>
                        <span
                          className={`mapped-status ${
                            cal.isMapped ? "mapped" : "unmapped"
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
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀ Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}

      {/* Message for Super Admin before selection */}
      {isSuperAdmin && !selectedCompanyId && (
        <p className="no-data">Please select a company to view calendars.</p>
      )}
    </div>
  );
};

export default AllCalendar;
