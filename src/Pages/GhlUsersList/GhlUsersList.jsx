import React, { useEffect, useState } from "react";
import {
  getAllGhlUsersApi,
  mapGhlUserApi,
  removeMappedUserApi,
} from "../../Apis/CompanyAdminApis/CompanyApis";
import { useAuth } from "../../Utils/AuthContext";
import toast from "react-hot-toast";
import "./style.css";

const GhlUsersList = () => {
  const { user } = useAuth();
  const {companyId} = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [unMappedUsers, setUnMappedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchGhlUser = async () => {
    try {
      const res = await getAllGhlUsersApi(companyId);
      console.log(res)
      if (res.data.success) {
        const users = res.data.users || [];
        setAllUsers(users);

        const mapped = users.filter((u) => u.isMapped === true);
        const unmapped = users.filter(
          (u) => u.isMapped === false || u.isMapped === undefined
        );

        setMappedUsers(mapped);
        setUnMappedUsers(unmapped);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 Map selected users
  const mapUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to map.");
      return;
    }

    try {
      setLoading(true);
      const response = await mapGhlUserApi(companyId, { userIds: selectedUsers });
      if (response.data.success) {
        toast.success(response.data.message || "Users mapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(response.data.message || "Failed to map users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while mapping users.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Remove mapped users
  const removeMappedUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one mapped user to remove.");
      return;
    }

    try {
      setLoading(true);
      const response = await removeMappedUserApi(companyId, {
        userIds: selectedUsers,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Users unmapped successfully!");
        setSelectedUsers([]);
        fetchGhlUser();
      } else {
        toast.error(response.data.message || "Failed to unmap users.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while unmapping users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchGhlUser();
  }, [companyId]);

  const getActiveData = () => {
    if (activeTab === "mapped") return mappedUsers;
    if (activeTab === "unmapped") return unMappedUsers;
    return allUsers;
  };

  const data = getActiveData();

  // pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(data.length / usersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrev = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);


  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [activeTab]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  return (
    <div className="ghl-container">
      <h2 className="ghl-title">GHL Users List</h2>

      {/* Tabs */}
      <div className="ghl-tabs">
        <button
          className={`ghl-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Users
        </button>
        <button
          className={`ghl-tab ${activeTab === "mapped" ? "active" : ""}`}
          onClick={() => setActiveTab("mapped")}
        >
          Mapped Users
        </button>
        <button
          className={`ghl-tab ${activeTab === "unmapped" ? "active" : ""}`}
          onClick={() => setActiveTab("unmapped")}
        >
          Unmapped Users
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
                  colSpan={activeTab === "unmapped" || activeTab === "mapped" ? "6" : "5"}
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
                        onChange={() => handleCheckboxChange(u.id || u.ghlUserId)}
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
            disabled={loading || selectedUsers.length === 0}
          >
            {loading ? "Mapping..." : `Map Selected (${selectedUsers.length})`}
          </button>
        </div>
      )}

      {activeTab === "mapped" && currentUsers.length > 0 && (
        <div className="map-btn-container">
          <button
            onClick={removeMappedUsers}
            className="unmap-btn"
            disabled={loading || selectedUsers.length === 0}
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

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`page-btn ${
                  currentPage === pageNumber ? "active" : ""
                }`}
              >
                {pageNumber}
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
    </div>
  );
};

export default GhlUsersList;
