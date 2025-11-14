import React, { useEffect, useState } from "react";
import "./style.css";
import axiosInstance from "../../Apis/axiosInstance"; // adjust endpoint if needed
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import { deleteStudioApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import EditStudioModal from "../../Component/EditStudioPopup/EditStudioModal";
import toast from "react-hot-toast";
import { MapPin, Edit3, Trash2 } from "lucide-react";

const AllStudios = () => {
  // local state (replaces Redux)
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(false);

  // NO localStorage persistence — start empty
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const { companyId, isCompanyAdmin, user, isSuperAdmin } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [editingStudio, setEditingStudio] = useState(null);

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = (page - 1) * rowsPerPage;
  const currentStudios = studios.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(studios.length / rowsPerPage));

  // helper: fetch studios for a given company
  const fetchStudiosForCompany = async (companyIdToFetch) => {
    if (!companyIdToFetch) {
      setStudios([]);
      return;
    }

    try {
      setLoading(true);

      // === ADJUST THIS ENDPOINT if your backend route differs ===
      // Example endpoints you might have:
      // axiosInstance.get(`/studios/company/${companyIdToFetch}`)
      // axiosInstance.get(`/company/${companyIdToFetch}/studios`)
      const res = await axiosInstance.get(`/studios?companyId=${companyIdToFetch}`);

      // Expectation: res.data.studios OR res.data.data OR res.data
      const data =
        res?.data?.studios ?? res?.data?.data ?? res?.data ?? [];

      const studiosArray = Array.isArray(data) ? data : [];

      setStudios(studiosArray);
    } catch (err) {
      console.error("Failed to fetch studios:", err);
      toast.error("Failed to load studios");
      setStudios([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch studios when component mounts or selection changes
  useEffect(() => {
    setPage(1);

    if (isCompanyAdmin && user?.companyId) {
      // company admin always sees their company studios
      fetchStudiosForCompany(user.companyId);
      return;
    }

    if (isSuperAdmin) {
      if (selectedCompanyId) {
        // only fetch when superadmin actively selected a company
        fetchStudiosForCompany(selectedCompanyId);
      } else {
        // no selection => make sure list is empty (prevent stale display)
        setStudios([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyAdmin, isSuperAdmin, selectedCompanyId, user?.companyId]);

  const handleDelete = async (studioId) => {
    if (!window.confirm("Are you sure you want to delete this studio?")) return;

    setDeletingId(studioId);
    try {
      const targetCompany = isSuperAdmin ? selectedCompanyId : companyId;
      const res = await deleteStudioApi(targetCompany, studioId);
      if (res?.data?.success) {
        toast.success(res.data.message || "Studio deleted");
        // refetch after delete
        const refetchCompany = isSuperAdmin ? selectedCompanyId : user?.companyId || companyId;
        await fetchStudiosForCompany(refetchCompany);
      } else {
        toast.error(res?.data?.message || "Failed to delete studio");
      }
    } catch (err) {
      console.error("delete studio err", err);
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="studio-dashboard-section">
      {/* Header */}
      <div className="studio-dashboard-header">
        <div className="studio-dashboard-title-wrap">
          <div className="studio-dashboard-icon-circle">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="studio-dashboard-title">All Studios</h2>
            <p className="studio-dashboard-subtitle">
              View, edit and manage studios for selected company.
            </p>
          </div>
        </div>
      </div>

      {/* Company selector for super admin */}
      {isSuperAdmin && (
        <div className="studio-dashboard-company-select" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
          {/* optional clear button so superadmin can clear selection quickly */}
          {selectedCompanyId && (
            <button
              onClick={() => {
                setSelectedCompanyId("");
                setStudios([]); // ensure UI clears immediately
              }}
              className="clear-company-btn"
              title="Clear selection"
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="studio-dashboard-loading">
          <MediumSpinner />
        </div>
      ) : (
        <>
          <div className="studio-dashboard-table-card">
            {studios.length === 0 ? (
              <div className="studio-dashboard-no-data">No studios found.</div>
            ) : (
              <div className="studio-dashboard-table-wrapper">
                <table className="studio-dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Company ID</th>
                      <th>Default Calendar</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudios.map((studio, idx) => (
                      <tr key={studio.id || idx}>
                        <td>{studio.name || "-"}</td>
                        <td>{studio.email || "-"}</td>
                        <td>{studio.phone || "-"}</td>
                        <td>{studio.location || "-"}</td>
                        <td>{studio.companyId || "-"}</td>
                        <td>{studio.defaultCalendar || "-"}</td>
                        <td className="studio-dashboard-actions">
                          <button
                            className="studio-dashboard-edit-btn"
                            onClick={() => setEditingStudio(studio)}
                            title="Edit studio"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            className="studio-dashboard-delete-btn"
                            onClick={() => handleDelete(studio.id)}
                            disabled={deletingId === studio.id}
                            title="Delete studio"
                          >
                            {deletingId === studio.id ? <SmallSpinner /> : <Trash2 size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {studios.length > 0 && (
            <div className="studio-dashboard-pagination-wrapper">
              <div className="studio-dashboard-pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="studio-dashboard-page-btn"
                >
                  ◀ Prev
                </button>
                <span className="studio-dashboard-page-info">
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="studio-dashboard-page-btn"
                >
                  Next ▶
                </button>
              </div>

              <div className="studio-dashboard-rows-selector">
                <label>Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={studios.length}>All</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editingStudio && (
        <EditStudioModal
          selectedStudioId={editingStudio.id}
          studioName={editingStudio.name}
          company={isSuperAdmin ? selectedCompanyId : companyId}
          onClose={() => {
            setEditingStudio(null);
            // refetch after edit
            const refetchCompany = isSuperAdmin ? selectedCompanyId : user?.companyId || companyId;
            fetchStudiosForCompany(refetchCompany);
          }}
        />
      )}
    </div>
  );
};

export default AllStudios;
