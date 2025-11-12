import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaArrowLeft,
  FaTimes,
  FaTachometerAlt,
  FaCog,
  FaUsers
} from "react-icons/fa";
import { IoIosCreate, IoIosListBox } from "react-icons/io";
import { MdOutlineTipsAndUpdates,MdMiscellaneousServices } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa6";
import { useAuth } from "../../Utils/AuthContext";
import { FiLogOut } from "react-icons/fi"; 
import MediumSpinner from "../../Utils/MediumSpinner/MediumSpinner";
import { GrDocumentUpdate } from "react-icons/gr";
import { IoCalendarClear } from "react-icons/io5";
import "./style.css";
import { DiOnedrive } from "react-icons/di";
import ProfileModal from "../../Component/ProfileModal/ProfileModal";
import { FaTable } from "react-icons/fa";
import { GiArchiveRegister } from "react-icons/gi";


// ===== Sidebar Options =====
const sidebarOptions = [
  // {
  //   title: "Dashboard",
  //   path: "/",
  //   icon: <FaTachometerAlt size={22} />,
  //   roles: ["superAdmin", "companyAdmin"], // visible to both
  // },
  {
    title : "Appointments",
    path: "/all-appointment",
    icon : <FaTable size={22}/>,

    roles: ["superAdmin", "companyAdmin"],
  },
  {
    title: "Update Branding",
    path: "/update-branding",
    icon: <MdOutlineTipsAndUpdates size={22} />,
    roles: ["superAdmin"], // only for super admin
  },
  {
    title: "Companies List",
    path: "/companies-list",
     icon: <IoIosListBox size={22} />,
    roles: ["superAdmin"], // only for super admin
  },
  {
    title: "Stuidios List",
    path: "/all-studios",
    icon: <IoIosListBox size={22} />,
    roles: ["superAdmin", "companyAdmin"], // visible to both
  },
  {
    title: "Ghl Users",
    path: "/ghl-user-list",
    icon : <FaUsers  size={22}/>,
    roles : ["companyAdmin","superAdmin"]
  },
  {
    title : "All Calendars",
    path: "/all-calendars-list",
    icon : <IoCalendarClear size={22} />,
    roles : ["superAdmin","companyAdmin"]
  }
];

// ===== Settings Options =====
const settingsOptions = [
  {
    title: "Create Studio",
    path: "/settings/create-studio",
    icon: <IoIosCreate size={20} />,
    roles: ["companyAdmin","superAdmin"], // both
  },
  {
    title: "Create Company",
    path: "/settings/create-company",
    icon: <IoIosCreate size={20} />,
    roles: ["superAdmin"], // only super admin
  },
  {
    title: "Create User",
    path: "/settings/create-user",
    icon: <FaUserPlus size={20} />,
    roles: ["superAdmin"], // only super admin
  },
  {
    title :"Map Services & Combo",
    path: "/settings/map-service-and-combo",
    icon : <MdMiscellaneousServices size={20}/>,
    roles : ["superAdmin","companyAdmin"]
  },
  {
    title: "Update Calendar",
    path: "/settings/update-calendar",
    icon: <GrDocumentUpdate size={20}/>,
    roles: ["superAdmin","companyAdmin"]
  },
  {
    title : "Register Ghl User",
    path:"/settings/register-ghl-user",
    icon : <GiArchiveRegister  size ={20} />,
    roles : ["superAdmin"]
  }
];


const MainLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSuperAdmin, isCompanyAdmin, user,userLoading, handleLogout} = useAuth();
  const [showProfile,setShowProfile] = useState(false);
  console.log(user)
  

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Role-based filter
  const getVisibleOptions = (options) => {
    return options.filter((option) =>
      option.roles.includes(isSuperAdmin ? "superAdmin" : "companyAdmin")
    );
  };

  // Determine back button visibility
  const shouldShowBackButton = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "settings") return segments.length > 2;
    return segments.length > 1;
  })();


  if(userLoading){
    return <div style={{display:'flex',width: "100%", height: "100vh" , alignItems: "center", justifyContent: "center"}}>
      <MediumSpinner />
    </div>
  }
  return (
    <div className="main-layout"  key={isSuperAdmin ? "superAdmin" : isCompanyAdmin ? "companyAdmin" : "guest"}>
      {/* ===== Sidebar ===== */}
      <aside
        className={`sidebar ${isSidebarOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          {!isCollapsed && <h2>Admin Panel</h2>}

          {/* Collapse (Desktop) */}
          <button className="collapse-btn" onClick={() => setIsCollapsed((p) => !p)}>
            <FaBars size={20} />
          </button>

          {/* Close (Mobile) */}
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {/* Main Options */}
          {getVisibleOptions(sidebarOptions).map((option, idx) => {
            const isActive = pathname === option.path;
            return (
              <button
                key={idx}
                className={`sidebar-option ${isActive ? "active" : ""}`}
                onClick={() => {
                  navigate(option.path);
                  setIsSidebarOpen(false);
                }}
              >
                {option.icon}
                {!isCollapsed && <span>{option.title}</span>}
              </button>
            );
          })}

          <div className="sidebar-divider" />

         {/* Settings Dropdown */}
<div className="settings-section" style={{ position: "relative" }}>
  <button
    className={`sidebar-option settings-btn ${isSettingsOpen ? "open" : ""}`}
    onClick={() => setIsSettingsOpen((p) => !p)}
  >
    <FaCog size={22} />
    {!isCollapsed && <span>Settings</span>}
  </button>

  {isSettingsOpen && (
    <div className={`settings-dropdown ${isCollapsed ? "collapsed-dropdown" : ""}`}>
      {getVisibleOptions(settingsOptions).map((option, idx) => {
        const isActive = pathname === option.path;
        return (
          <button
            key={idx}
            className={`sidebar-option sub-option ${isActive ? "active" : ""}`}
            onClick={() => {
              navigate(option.path);
              setIsSidebarOpen(false);
              setIsSettingsOpen(false); // close after navigation
            }}
          >
            {option.icon}
            <span>{option.title}</span>
          </button>
        );
      })}
    </div>
  )}
</div>

          
        </nav>
        <div className="profile-logout-section">
           <div className="profile-section" onClick={() => setShowProfile(true)}>
               <div className="profile-img">

               </div>
               <div className="user-info-section">
                <p>{user?.name || "-"}</p>
                <small>{user?.email || "-"}</small>
               </div>

           </div>
           <div className="sidebar-logout">
            <button className="sidebar-option logout-btn" onClick={() => handleLogout("You have been logged out.")}>
              <FiLogOut size={22} />
            {!isCollapsed  && "Logout"}
            </button>
          </div>

        </div>
       
      
      </aside>

      {/* ===== Main Content ===== */}
      <div className="main-content">
        <header className="main-header">
          <div className="hamburger" onClick={() => setIsSidebarOpen((p) => !p)}>
            <FaBars size={24} />
          </div>
        </header>

        <main>
          {shouldShowBackButton && (
            <div
              className="back-button-superadmin"
              onClick={() => navigate(-1)}
              title="Go Back"
            >
              <FaArrowLeft size={24} />
            </div>
          )}

          <div className="super-admin-outlet-cont">
            <Outlet />
          </div>
        </main>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default MainLayout;
