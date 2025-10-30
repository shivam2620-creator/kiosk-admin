import "./style.css";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import { DeleteCompanyApi } from "../../Apis/SuperAdminApis/DeleteCompanyApi";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AllCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  
  const fetchCompanyDetails = async () => {
    try {
      setDataLoading(true);
      const response = await getAllCompanyApi();
      setCompanies(response?.data?.companies || []);

    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
        setDataLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    console.log("Deleting company with ID:", companyId);
    try {
      setDeletingId(companyId); // ✅ set current deleting company
      const response = await DeleteCompanyApi(companyId);
      console.log("Delete Response:", response);
      toast.success("Company deleted successfully");
      await fetchCompanyDetails();
    } catch (err) {
      console.error("Error deleting company:", err);
      toast.error("Failed to delete company");
    } finally {
      setDeletingId(null); // ✅ reset deleting state
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  return (
    <div className="company-list-container">
      <h2 className="table-title">All Companies</h2>

      <div className="table-wrapper">
        <table className="company-table">
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
            {dataLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Loading companies...
                </td>
              </tr>
            ) : companies.length > 0 ? (
              companies.map((company, index) => (
                <tr key={company.id || index}>
                  <td>{company.name || "-"}</td>
                  <td>{company.email || "-"}</td>
                  <td>{company.owner || "-"}</td>
                  <td>{company.address || "-"}</td>
                  <td className={`status ${company.status}`}>
                    {company.status}
                  </td>
                  <td>{company.isDeleted ? "Yes" : "No"}</td>
                  <td>{company.setupStatus || "-"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(company.id)}
                      disabled={deletingId === company.id}
                    >
                      {deletingId === company.id ? (
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
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllCompanyList;
