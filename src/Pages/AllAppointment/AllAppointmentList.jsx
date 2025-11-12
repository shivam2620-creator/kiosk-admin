import React, { useState, useEffect } from "react";
import "./style.css";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import axiosInstance from "../../Apis/axiosInstance";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import DetailedAppointmentModal from "../../Component/DetailAppointmentModal/DetailedAppointmentModal";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const AllAppointmentList = () => {
  const { companyId, isSuperAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  // Filters
  const [appointmentDate, setAppointmentDate] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [status, setStatus] = useState("");

  // ✅ Client-Side Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = (page - 1) * rowsPerPage;
  const currentPageAppointments = appointments.slice(
    startIndex,
    startIndex + rowsPerPage
  );
  const totalPages = Math.ceil(appointments.length / rowsPerPage);

  // ✅ Fetch appointments once per filter change
  const fetchAppointments = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/appointment", { params: filters });
      if (res?.data?.appointments) {
        setAppointments(res.data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  const getFilters = () => ({
    ...(isSuperAdmin ? { companyId: selectedCompanyId } : { companyId }),
    ...(selectedStudioId && { studioId: selectedStudioId }),
    ...(appointmentDate && { appointmentDate }),
    ...(createdDate && { createdDate }),
    ...(status && { status }),
  });

  useEffect(() => {
    if (!isSuperAdmin && companyId) fetchAppointments({ companyId });
  }, [companyId, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && selectedCompanyId)
      fetchAppointments({ companyId: selectedCompanyId });
  }, [isSuperAdmin, selectedCompanyId]);

  useEffect(() => {
    fetchAppointments(getFilters());
    setPage(1);
  }, [selectedStudioId, appointmentDate, createdDate, status]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="appointments-section">
      {/* Header */}
      <div className="appointments-header">
        <div className="appointments-title-wrap">
          <div className="appointments-icon-circle">
            <CalendarDays size={20} className="icon" />
          </div>
          <div>
            <h2 className="appointments-title">All Appointments</h2>
            <p className="appointments-subtitle">
              Manage, filter, and view all appointments.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 — Company Selection */}
      {isSuperAdmin && (
        <div className="appointments-top-filter">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* Step 2 — Only show after company selection */}
      {(selectedCompanyId || !isSuperAdmin) && (
        <>
          <div className="appointments-top-filter">
            <StudioSelector
              selectedStudioId={selectedStudioId}
              setSelectedStudioId={setSelectedStudioId}
              company={isSuperAdmin ? selectedCompanyId : companyId}
            />
          </div>

          {/* Filters */}
          <div className="appointments-filter-bar">
            <div className="appointments-filter-item">
              <label>Appointment Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="appointments-filter-item">
              <label>Created Date</label>
              <input
                type="date"
                value={createdDate}
                onChange={(e) => setCreatedDate(e.target.value)}
              />
            </div>

            <div className="appointments-filter-item">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="appointments-content">
            {loading ? (
              <div className="appointments-loading-state">
                <MediumSpinner />
                <p>Loading appointments...</p>
              </div>
            ) : currentPageAppointments.length === 0 ? (
              <p className="appointments-no-data">No appointments found.</p>
            ) : (
              <div className="appointments-table-card">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageAppointments.map((a, i) => (
                      <tr key={i}>
                        <td>{a.full_name || a.name || "N/A"}</td>
                        <td>₹{a.amount || "—"}</td>
                        <td>
                          <span
                            className={`appointments-status-badge ${
                              a.appointmentStatus === "confirmed"
                                ? "appointments-status-confirmed"
                                : a.appointmentStatus === "cancelled"
                                ? "appointments-status-cancelled"
                                : "appointments-status-pending"
                            }`}
                          >
                            {a.appointmentStatus || "N/A"}
                          </span>
                        </td>
                        <td>{a.email || "-"}</td>
                        <td>
                          <button
                            className="appointments-action-btn"
                            onClick={() => {
                              setShowModal(true);
                              setSelectedAppointmentId(a.id);
                            }}
                          >
                            View Full
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ✅ Pagination + Rows per Page */}
          {!loading && currentPageAppointments.length > 0 && (
            <div className="appointments-pagination-wrapper">
              <div className="appointments-pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="appointments-rows-selector">
                <label>Rows per page:</label>
                <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={appointments.length}>All</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <DetailedAppointmentModal
          appointmentId={selectedAppointmentId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AllAppointmentList;
