import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../DashboardLayout/DashboardLayout.css";
import { FaTachometerAlt, FaGithub, FaChartBar, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import sonarLogo from "../../assets/logo.webp";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const sideMenus = [
    { title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { title: "Repo Explorer", path: "/dashboard/github-repos", icon: <FaGithub /> },
    { title: "Sonar Insights", path: "/dashboard/sonar-repo", icon: <FaChartBar /> },
    { title: "Knowledge Hub", path: "", icon: <FaQuestionCircle /> },
  ];

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={sonarLogo} alt="SonarHub Logo" className="sonarhub-logo" />
          </div>
          <div className="title-container">
            <h4 className="sidebar-title">
              <span className="sonar-text">Sonar</span>
              <span className="hub-text">Hub</span>
            </h4>
          </div>
        </div>
        <ul className="sidebar-nav">
          {sideMenus?.map((data) => (
            <li key={data.path}>
              <button className="nav-button" onClick={() => navigate(data?.path)}>
                {data.icon} {data.title}
              </button>
            </li>
          ))}

          <li>
            <button className="nav-button logout-button" onClick={logout}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;