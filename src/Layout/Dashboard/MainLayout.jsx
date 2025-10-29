import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaArrowLeft,
  FaTimes,
  FaTachometerAlt,
  FaCog,
} from "react-icons/fa";
import { IoIosCreate, IoIosListBox } from "react-icons/io";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa6";
import { useAuth } from "../../Utils/AuthContext";
import "./style.css";


// ===== Sidebar Options =====
const sidebarOptions = [
  {
    title: "Dashboard",
    path: "/",
    icon: <FaTachometerAlt size={22} />,
    roles: ["superAdmin", "companyAdmin"], // visible to both
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
];

// ===== Settings Options =====
const settingsOptions = [
  {
    title: "Create Studio",
    path: "/settings/create-studio",
    icon: <FaCog size={20} />,
    roles: ["superAdmin", "companyAdmin"], // both
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
];


const MainLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSuperAdmin, isCompanyAdmin } = useAuth();
  console.log("Role in MainLayout:", { isSuperAdmin, isCompanyAdmin });

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

  return (
    <div className="main-layout">
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
          <div className="settings-section">
            <button
              className={`sidebar-option settings-btn ${
                isSettingsOpen ? "open" : ""
              }`}
              onClick={() => setIsSettingsOpen((p) => !p)}
            >
              <FaCog size={22} />
              {!isCollapsed && <span>Settings</span>}
            </button>

            {!isCollapsed && isSettingsOpen && (
              <div className="settings-dropdown">
                {getVisibleOptions(settingsOptions).map((option, idx) => {
                  const isActive = pathname === option.path;
                  return (
                    <button
                      key={idx}
                      className={`sidebar-option sub-option ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => {
                        navigate(option.path);
                        setIsSidebarOpen(false);
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
    </div>
  );
};

export default MainLayout;
