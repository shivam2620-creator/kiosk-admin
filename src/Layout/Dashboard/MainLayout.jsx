import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IoIosCreate } from "react-icons/io";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaBars, FaArrowLeft, FaTimes, FaTachometerAlt } from "react-icons/fa";
import "./style.css";

const sidebarOptions = [
  {
    title: "Dashboard",
    path: "/",
    icon: <FaTachometerAlt size={22} />,
  },
  {
    icon: <IoIosCreate size={22} />,
    title: "Create Company",
    path: "/create-company",
  },
  {
    icon: <MdOutlineTipsAndUpdates size={22} />,
    title: "Update Branding",
    path: "/update-branding",
  },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // for mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // for desktop collapse

  const isHome = pathname === "/";

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          {!isCollapsed && <h2>Admin Panel</h2>}

          {/* Collapse button (desktop) */}
          <button className="collapse-btn" onClick={toggleCollapse}>
            <FaBars size={20} />
          </button>

          {/* Close button (mobile) */}
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {sidebarOptions.map((option, idx) => {
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
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="hamburger" onClick={toggleSidebar}>
            <FaBars size={24} />
          </div>
        </header>

        <main>
          {/* Show back button only for nested paths */}
{pathname.split("/").filter(Boolean).length > 1 && (
  <div
    className="back-button-superadmin"
    onClick={() => navigate(-1)}
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
