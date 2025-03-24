import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../DashboardLayout/DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const sideMenus =[{title:"Dashboard",path:"/dashboard"},{title:"Github Repos", path:"/dashboard/github-repos"},{title:"View Sonar Reports",path:"/dashboard/sonar-repo"},{title:"Learn More",path:""}];
  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h4 className="sidebar-title">Dashboard</h4>
        <ul className="sidebar-nav">
         {
            sideMenus?.map((data)=>(
                <li>
                <button className="nav-button" onClick={() => navigate(data?.path)}>
                 {data?.title}
                </button>
              </li>
            ))
         }
         
          <li>
            <button className="nav-button logout-button" onClick={logout}>
              Logout
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
