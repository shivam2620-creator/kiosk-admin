import React, { useEffect, useState } from "react";
import {
  getAllGhlUsersApi,
  mapGhlUserApi,
  removeMappedUserApi,
} from "../../Apis/CompanyAdminApis/CompanyApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
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

  const effectiveCompanyId = isSuperAdmin ? selectedCompanyId : companyId;

  // Fetch users
  const fetchGhlUser = async () => {
    if (!effectiveCompanyId) return;
    setLoading(true);
    try {
      const res = await getAllGhlUsersApi(effectiveCompanyId);
      if (res?.data?.success) {
        const users = res.data.users || [];
        setAllUsers(users);
        setMappedUsers(users.filter((u) => u.isMapped));
        setUnMappedUsers(users.filter((u) => !u.isMapped));
      } else {
        setAllUsers([]);
        setMappedUsers([]);
        setUnMappedUsers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
      setAllUsers([]);
      setMappedUsers([]);
      setUnMappedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Map users
  const mapUsers = async () => {
    if (!effectiveCompanyId) return toast.error("Select a company first.");
    if (selectedUsers.length === 0) return toast.error("Select at least one user.");

    try {
      setLoading(true);
      const res = await mapGhlUserApi(effectiveCompanyId, {
        userIds: selectedUsers,
      });
      if (res?.data?.success) {
        toast.success(res.data.message || "Users mapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(res?.data?.message || "Failed to map users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while mapping users.");
    } finally {
      setLoading(false);
    }
  };

  // Remove mapped users
  const removeMappedUsers = async () => {
    if (!effectiveCompanyId) return toast.error("Select a company first.");
    if (selectedUsers.length === 0) return toast.error("Select at least one user.");

    try {
      setLoading(true);
      const res = await removeMappedUserApi(effectiveCompanyId, {
        userIds: selectedUsers,
      });
      if (res?.data?.success) {
        toast.success(res.data.message || "Users unmapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(res?.data?.message || "Failed to unmap users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while unmapping users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset when company changes
    setSelectedUsers([]);
    setCurrentPage(1);
    if (effectiveCompanyId) fetchGhlUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCompanyId]);

  // active data + pagination
  const getActiveData = () => {
    if (activeTab === "mapped") return mappedUsers;
    if (activeTab === "unmapped") return unMappedUsers;
    return allUsers;
  };

  const data = getActiveData();
  const totalPages = Math.max(1, Math.ceil(data.length / usersPerPage));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => {
    // keep page within range when data or tab changes
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, activeTab]);

  useEffect(() => {
    // reset selection when tab or page changes
    setSelectedUsers([]);
  }, [activeTab, currentPage]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleReset = () => {
    setSelectedCompanyId("");
    setAllUsers([]);
    setMappedUsers([]);
    setUnMappedUsers([]);
    setSelectedUsers([]);
    setActiveTab("all");
    setCurrentPage(1);
  };

  const companySelected = !!effectiveCompanyId;

  return (
    <div className="gu-wrap">
      <header className="gu-header">
        <h2 className="gu-title">GHL Users</h2>
        <p className="gu-sub">Manage and map/unmap GHL users for the selected company.</p>
      </header>

      {/* Company selector */}
      <div className="gu-company-row">
        {isSuperAdmin ? (
          <>
            <div className="gu-company-select">
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </div>
            <div className="gu-company-actions">
              <button
                className="gu-reset-btn"
                onClick={handleReset}
                disabled={!selectedCompanyId && !companyId}
                title="Reset selection"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <div style={{ height: 12 }} />
        )}
      </div>

      {/* When no company selected */}
      {!companySelected ? (
        <div className="gu-empty">
          {loading ? (
            <div className="gu-loading">
              <MediumSpinner />
              <div className="gu-loading-text">Loading users…</div>
            </div>
          ) : (
            <div className="gu-no-company">
              {isSuperAdmin ? "Please select a company to view its GHL users." : "No company available."}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="gu-tabs">
            <button
              className={`gu-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            >
              All
            </button>
            <button
              className={`gu-tab ${activeTab === "mapped" ? "active" : ""}`}
              onClick={() => { setActiveTab("mapped"); setCurrentPage(1); }}
            >
              Mapped
            </button>
            <button
              className={`gu-tab ${activeTab === "unmapped" ? "active" : ""}`}
              onClick={() => { setActiveTab("unmapped"); setCurrentPage(1); }}
            >
              Unmapped
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="gu-loading">
              <MediumSpinner />
              <div className="gu-loading-text">Loading users…</div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="gu-table-wrap">
                <table className="gu-table">
                  <thead>
                    <tr>
                      {(activeTab === "unmapped" || activeTab === "mapped") && <th className="gu-col-check">Select</th>}
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
                        <td colSpan={(activeTab === "unmapped" || activeTab === "mapped") ? 6 : 5} className="gu-no-data">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((u) => {
                        const id = u.id || u.ghlUserId;
                        return (
                          <tr key={id}>
                            {(activeTab === "unmapped" || activeTab === "mapped") && (
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(id)}
                                  onChange={() => handleCheckboxChange(id)}
                                />
                              </td>
                            )}
                            <td>{u.firstName || "-"}</td>
                            <td>{u.lastName || "-"}</td>
                            <td>{u.email || "-"}</td>
                            <td>{u.role || "-"}</td>
                            <td>
                              {u.isMapped ? <span className="gu-mapped">Yes</span> : <span className="gu-unmapped">No</span>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="gu-action-row">
                {activeTab === "unmapped" && (
                  <button
                    className="gu-map-btn"
                    onClick={mapUsers}
                    disabled={loading || selectedUsers.length === 0}
                  >
                    {loading ? "Mapping…" : `Map Selected (${selectedUsers.length})`}
                  </button>
                )}

                {activeTab === "mapped" && (
                  <button
                    className="gu-unmap-btn"
                    onClick={removeMappedUsers}
                    disabled={loading || selectedUsers.length === 0}
                  >
                    {loading ? "Removing…" : `Remove Selected (${selectedUsers.length})`}
                  </button>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="gu-pagination">
                  <button className="gu-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    ◀ Prev
                  </button>

                  <div className="gu-page-numbers">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          className={`gu-page-btn ${currentPage === num ? "active" : ""}`}
                          aria-current={currentPage === num ? "page" : undefined}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  <button className="gu-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GhlUsersList;
