import "./style.css";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import { DeleteCompanyApi } from "../../Apis/SuperAdminApis/DeleteCompanyApi";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Trash2 } from "lucide-react";

const AllCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = (page - 1) * rowsPerPage;
  const currentCompanies = companies.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(companies.length / rowsPerPage));

  const fetchCompanyDetails = async () => {
    try {
      setDataLoading(true);
      const response = await getAllCompanyApi();
      setCompanies(response?.data?.companies || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      toast.error("Failed to load companies.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    try {
      setDeletingId(companyId);
      await DeleteCompanyApi(companyId);
      toast.success("Company deleted successfully");
      // Refresh list after deletion
      await fetchCompanyDetails();
    } catch (err) {
      console.error("Error deleting company:", err);
      toast.error("Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    // Keep page within bounds if rowsPerPage changed
  };

  return (
    <div className="company-dashboard-section">
      {/* Header */}
      <div className="company-dashboard-header">
        <div className="company-dashboard-title-wrap">
          <div className="company-dashboard-icon-circle">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="company-dashboard-title">All Companies</h2>
            <p className="company-dashboard-subtitle">
              Manage, monitor, and delete companies under your control.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {dataLoading ? (
        <div className="company-dashboard-loading">
          <MediumSpinner />
          <p>Loading companies...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="company-dashboard-table-card">
            {companies.length === 0 ? (
              <div className="company-dashboard-no-data">No companies found.</div>
            ) : (
              <div className="company-dashboard-table-wrapper">
                <table className="company-dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Owner</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Is Deleted</th>
                      <th>Setup Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCompanies.map((company, index) => (
                      <tr key={company.id || index}>
                        <td>{company.name || "-"}</td>
                        <td>{company.email || "-"}</td>
                        <td>{company.owner || "-"}</td>
                        <td>{company.address || "-"}</td>
                        <td>
                          <span
                            className={`company-dashboard-status-badge ${
                              company.status === "active"
                                ? "company-dashboard-status-active"
                                : "company-dashboard-status-inactive"
                            }`}
                          >
                            {company.status || "-"}
                          </span>
                        </td>
                        <td>{company.isDeleted ? "Yes" : "No"}</td>
                        <td>{company.setupStatus || "-"}</td>
                        <td>
                          <button
                            className="company-dashboard-delete-btn"
                            onClick={() => handleDelete(company.id)}
                            disabled={deletingId === company.id}
                            title="Delete company"
                          >
                            {deletingId === company.id ? (
                              <SmallSpinner />
                            ) : (
                              <Trash2 size={16} />
                            )}
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
          {companies.length > 0 && (
            <div className="company-dashboard-pagination-wrapper">
              <div className="company-dashboard-pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="company-dashboard-page-btn"
                >
                  ◀ Prev
                </button>
                <span className="company-dashboard-page-info">
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="company-dashboard-page-btn"
                >
                  Next ▶
                </button>
              </div>

              <div className="company-dashboard-rows-selector">
                <label>Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRowsPerPage(v);
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={companies.length}>All</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllCompanyList;
