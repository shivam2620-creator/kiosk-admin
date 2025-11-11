import React, { useState, useEffect } from "react";
import "./style.css";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import StudioSelector from "../../Component/StudioSelector/StudioSelector";
import axiosInstance from "../../Apis/axiosInstance";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import DetailedAppointmentModal from "../../Component/DetailAppointmentModal/DetailedAppointmentModal";
import toast from "react-hot-toast";

const AllAppointmentList = () => {
  const { companyId, isSuperAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  // ✅ Filter States
  const [appointmentDate, setAppointmentDate] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [status, setStatus] = useState("");

  // ✅ Fetch Appointments
  const fetchAppointments = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/appointment", { params: filters });
      if (res?.data) {
        setAppointments(res.data.appointments || []);
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

  // ✅ 1️⃣ Initial Fetch — only once, with companyId (if available)
  useEffect(() => {
    if (!isSuperAdmin && companyId) {
      fetchAppointments({ companyId }); // company admin fetches for their company
    }
  }, [companyId, isSuperAdmin]);

  // ✅ 2️⃣ For SuperAdmin — wait for company selection
  useEffect(() => {
    if (isSuperAdmin && selectedCompanyId) {
      fetchAppointments({ companyId: selectedCompanyId });
    }
  }, [isSuperAdmin, selectedCompanyId]);

  // ✅ 3️⃣ Refetch only when filters/studio change
  useEffect(() => {
    // Skip on initial mount (covered by previous useEffect)
    const params = {
      ...(isSuperAdmin
        ? { companyId: selectedCompanyId }
        : { companyId: companyId }),
      ...(selectedStudioId ? { studioId: selectedStudioId } : {}),
      ...(appointmentDate ? { appointmentDate } : {}),
      ...(createdDate ? { createdDate } : {}),
      ...(status ? { status } : {}),
    };

    // Only fetch if filters are explicitly selected or changed
    if (
      appointmentDate ||
      createdDate ||
      status ||
      selectedStudioId
    ) {
      fetchAppointments(params);
    }
  }, [selectedStudioId, appointmentDate, createdDate, status]);

  return (
    <div className="all-appointment-container">
      <h2>All Appointments</h2>

      {/* 🔸 SuperAdmin: Company Selector */}
      {isSuperAdmin && (
        <div className="form-section">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {/* 🔸 Studio Selector */}
      <div className="form-section">
        <StudioSelector
          selectedStudioId={selectedStudioId}
          setSelectedStudioId={setSelectedStudioId}
          company={isSuperAdmin ? selectedCompanyId : companyId}
        />
      </div>

      {/* 🔸 Filters */}
      <div className="filters-row">
        <div>
          <label>Appointment Date</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
        </div>

        <div>
          <label>Created Date</label>
          <input
            type="date"
            value={createdDate}
            onChange={(e) => setCreatedDate(e.target.value)}
          />
        </div>

        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* 🔸 Appointment Table */}
      {loading ? (
        <div className="loading-section">
          <MediumSpinner />
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <p className="no-data">No appointments found.</p>
      ) : (
        <div className="calendar-table-wrapper">
          <table className="appointment-table">
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
              {appointments.map((a, i) => (
                <tr key={i}>
                  <td>{a.fullName || "N/A"}</td>
                  <td>₹{a.amount || "—"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        a.appointmentStatus === "confirmed"
                          ? "status-confirmed"
                          : "status-cancelled"
                      }`}
                    >
                      {a.appointmentStatus || "N/A"}
                    </span>
                  </td>
                  <td>{a.email || "-"}</td>
                  <td>
                    <button
                      className="view-btn"
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
