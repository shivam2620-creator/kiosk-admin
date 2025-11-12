import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector, useDispatch } from "react-redux";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { fetchAllStudios } from "../../Utils/fetchAllStudios";
import { useAuth } from "../../Utils/AuthContext";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import { deleteStudioApi } from "../../Apis/CompanyAdminApis/StudiosApis";
import EditStudioModal from "../../Component/EditStudioPopup/EditStudioModal";
import toast from "react-hot-toast";

const AllStudios = () => {
  const studios = useSelector((state) => state.studio.studioData || []);
  const loading = useSelector((state) => state.studio.loading);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const { companyId, isCompanyAdmin, user, isSuperAdmin } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [editingStudio, setEditingStudio] = useState(null);
  const dispatch = useDispatch();

  // ✅ Fetch studios
  useEffect(() => {
    if (isCompanyAdmin) fetchAllStudios(user.companyId, dispatch);
    if (isSuperAdmin && selectedCompanyId)
      fetchAllStudios(selectedCompanyId, dispatch);
  }, [isCompanyAdmin, selectedCompanyId]);

  // ✅ Delete studio with loader on that row
  const handleDelete = async (studioId) => {
    setDeletingId(studioId);
    try {
      const response = await deleteStudioApi(companyId, studioId);
      if (response.data.success) {
        toast.success(response.data.message || "Studio deleted successfully");
        if (isCompanyAdmin) fetchAllStudios(user.companyId, dispatch);
        if (isSuperAdmin && selectedCompanyId)
          fetchAllStudios(selectedCompanyId, dispatch);
      } else {
        toast.error(response.data.message || "Failed to delete studio");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="studio-list-container">
      <h2 className="studio-table-title">All Studios</h2>

      {isSuperAdmin && (
        <div style={{ width: "30%", marginBottom: "20px" }}>
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}

      {loading ? (
        <div className="studio-loading-wrapper">
          <MediumSpinner />
        </div>
      ) : (
        <div className="studio-table-wrapper">
          <table className="studio-table">
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
              {studios.length > 0 ? (
                studios.map((studio, index) => (
                  <tr key={studio.id || index}>
                    <td>{studio.name || "-"}</td>
                    <td>{studio.email || "-"}</td>
                    <td>{studio.phone || "-"}</td>
                    <td>{studio.location || "-"}</td>
                    <td>{studio.companyId || "-"}</td>
                    <td>{studio.defaultCalendar || "-"}</td>
                    <td className="studio-actions">
                      <button
                        className={`studio-edit-btn`}
                        onClick={() => setEditingStudio(studio)}
                      >
                        Edit
                      </button>
                      <button
                        className={`studio-delete-btn ${
                          deletingId === studio.id ? "disabled" : ""
                        }`}
                        onClick={() => handleDelete(studio.id)}
                        disabled={deletingId === studio.id}
                      >
                        {deletingId === studio.id ? (
                          <SmallSpinner />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No studios found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🟢 Edit Calendar Modal */}
      {editingStudio && (
        <EditStudioModal
          selectedStudioId={editingStudio.id}
          studioName={editingStudio.name}
          company = {selectedCompanyId}
          onClose={() => setEditingStudio(null)}
        />
      )}
    </div>
  );
};

export default AllStudios;
