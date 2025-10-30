import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector } from "react-redux";
import SmallSpinner from "../../Utils/SmallSpinner/SmallSpinner";
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { fetchAllStudios } from "../../Utils/fetchAllStudios";
import { useDispatch } from "react-redux";
import { useAuth } from "../../Utils/AuthContext";
import getAllCompanyApi from "../../Apis/SuperAdminApis/getAllCompanyApi";
import CompanySelector from "../../Component/CompanySelector/CompanySelector";


const AllStudios = () => {
  const studios = useSelector((state) => state.studio.studioData || []);
  const loading = useSelector((state) => state.studio.loading);
  const [selectedCompanyId, setSelectedCompanyId]  = useState("");

  const [companies,setCompanies] = useState([])
  console.log(companies);
  const dispatch = useDispatch();
  const {isCompanyAdmin,user,isSuperAdmin} = useAuth(); 
  

  const [deletingId, setDeletingId] = useState(null);

   
  useEffect(() => {

   if(isCompanyAdmin) fetchAllStudios(user.companyId,dispatch); 
   if(isSuperAdmin) fetchAllStudios(selectedCompanyId,dispatch); 

   
  },[isCompanyAdmin])




  // ✅ Delete studio
  const handleDelete = async (studioId) => {
 
      setDeletingId(studioId);
       setTimeout(() => {
 setDeletingId(null);
       },1000)
   
     

  };

  return (
    <div className="studio-list-container">
      <h2 className="studio-table-title">All Studios</h2>
     { isSuperAdmin &&  <div style={{width: "30%", marginBottom : "20px"}}>
         <CompanySelector selectedCompanyId={selectedCompanyId} setSelectedCompanyId={setSelectedCompanyId} />
      </div>}
      {/* ✅ Show medium spinner outside the table */}
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
                    <td>
                      <button
                        className="studio-delete-btn"
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
    </div>
  );
};

export default AllStudios;
