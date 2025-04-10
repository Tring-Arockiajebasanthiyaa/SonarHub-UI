import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "../DashboardLayout/DashboardLayout.css";
import { FaTachometerAlt, FaGithub, FaChartBar, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import sonarLogo from "../../assets/logo.webp";
import { FaCodePullRequest } from "react-icons/fa6";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const sideMenus = [
    { title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { title: "Repo Explorer", path: "/dashboard/github-repos", icon: <FaGithub /> },
    { title: "Sonar Insights", path: "/dashboard/sonar-repo", icon: <FaChartBar /> },
    { title: "Pull Requests", path: "/dashboard/pull-requests",icon: <FaCodePullRequest /> },
    { title: "Knowledge Hub", path: "/dashboard/learn-more", icon: <FaQuestionCircle /> },
  ];

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={sonarLogo} alt="SonarHub Logo" className="sonarhub-logo" />
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