import React, { useEffect, useState } from "react";
import {
  getAllGhlUsersApi,
  mapGhlUserApi,
  removeMappedUserApi,
} from "../../Apis/CompanyAdminApis/CompanyApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import "./style.css";

const GhlUsersList = () => {
  const { companyId, isSuperAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [unMappedUsers, setUnMappedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const effectiveCompanyId = isSuperAdmin
    ? selectedCompanyId
    : companyId;

  // ✅ Fetch Users
  const fetchGhlUser = async () => {
    if (!effectiveCompanyId) return;
    try {
      const res = await getAllGhlUsersApi(effectiveCompanyId);
      if (res.data.success) {
        const users = res.data.users || [];
        setAllUsers(users);
        setMappedUsers(users.filter((u) => u.isMapped));
        setUnMappedUsers(users.filter((u) => !u.isMapped));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  // ✅ Map Users
  const mapUsers = async () => {
    if (!effectiveCompanyId) return toast.error("Select a company first.");
    if (selectedUsers.length === 0)
      return toast.error("Please select at least one user to map.");

    try {
      setLoading(true);
      const res = await mapGhlUserApi(effectiveCompanyId, {
        userIds: selectedUsers,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Users mapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(res.data.message || "Failed to map users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while mapping users.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove Mapped Users
  const removeMappedUsers = async () => {
    if (!effectiveCompanyId) return toast.error("Select a company first.");
    if (selectedUsers.length === 0)
      return toast.error("Please select at least one user to unmap.");

    try {
      setLoading(true);
      const res = await removeMappedUserApi(effectiveCompanyId, {
        userIds: selectedUsers,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Users unmapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(res.data.message || "Failed to unmap users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while unmapping users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveCompanyId) fetchGhlUser();
  }, [effectiveCompanyId]);

  // pagination setup
  const getActiveData = () => {
    if (activeTab === "mapped") return mappedUsers;
    if (activeTab === "unmapped") return unMappedUsers;
    return allUsers;
  };

  const data = getActiveData();
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(data.length / usersPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [activeTab]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleReset = () => {
    setSelectedCompanyId("");
    setAllUsers([]);
    setMappedUsers([]);
    setUnMappedUsers([]);
    setSelectedUsers([]);
    setActiveTab("all");
  };

  const companySelected = !!effectiveCompanyId;

  return (
    <div className="ghl-container">
      <h2 className="ghl-title">GHL Users</h2>

      {/* SuperAdmin: Company Selector */}
      {isSuperAdmin && (
        <div className="company-select-section">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />

          {selectedCompanyId && (
            <button className="reset-btn" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      )}

      {/* Don’t render table/tabs until company is selected */}
      {!companySelected ? (
        <p className="no-company-msg">
          {isSuperAdmin
            ? "Please select a company to view its GHL users."
            : "Loading your company users..."}
        </p>
      ) : (
        <>
          {/* Tabs */}
          <div className="ghl-tabs">
            <button
              className={`ghl-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`ghl-tab ${activeTab === "mapped" ? "active" : ""}`}
              onClick={() => setActiveTab("mapped")}
            >
              Mapped
            </button>
            <button
              className={`ghl-tab ${activeTab === "unmapped" ? "active" : ""}`}
              onClick={() => setActiveTab("unmapped")}
            >
              Unmapped
            </button>
          </div>

          {/* Table */}
          <div className="ghl-table-wrapper">
            <table className="ghl-table">
              <thead>
                <tr>
                  {(activeTab === "unmapped" || activeTab === "mapped") && <th>Select</th>}
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Mapped?</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        activeTab === "unmapped" || activeTab === "mapped"
                          ? "6"
                          : "5"
                      }
                      className="no-users"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => (
                    <tr key={u.id || u.ghlUserId}>
                      {(activeTab === "unmapped" || activeTab === "mapped") && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(u.id || u.ghlUserId)}
                            onChange={() =>
                              handleCheckboxChange(u.id || u.ghlUserId)
                            }
                          />
                        </td>
                      )}
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        {u.isMapped ? (
                          <span className="mapped">Yes</span>
                        ) : (
                          <span className="unmapped">No</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          {activeTab === "unmapped" && currentUsers.length > 0 && (
            <div className="map-btn-container">
              <button
                onClick={mapUsers}
                className="map-btn"
                disabled={
                  loading || selectedUsers.length === 0 || !effectiveCompanyId
                }
              >
                {loading
                  ? "Mapping..."
                  : `Map Selected (${selectedUsers.length})`}
              </button>
            </div>
          )}

          {activeTab === "mapped" && currentUsers.length > 0 && (
            <div className="map-btn-container">
              <button
                onClick={removeMappedUsers}
                className="unmap-btn"
                disabled={
                  loading || selectedUsers.length === 0 || !effectiveCompanyId
                }
              >
                {loading
                  ? "Removing..."
                  : `Remove Selected (${selectedUsers.length})`}
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ◀ Prev
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const num = i + 1;
                return (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
                    className={`page-btn ${
                      currentPage === num ? "active" : ""
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GhlUsersList;
