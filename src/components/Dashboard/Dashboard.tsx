import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useMutation, gql } from "@apollo/client";

interface DashboardProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Dashboard: React.FC<DashboardProps> = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");

    // Update authentication state
    setIsAuthenticated(false);

    // Redirect to landing page
    navigate("/", { replace: true });
  };



  return (
    <div className="landing-page">
      <div className="container">
        <header className="header">
          <h4 className="header-title">GitHub</h4>
          <nav className="header-nav">
            <button className="nav-button" onClick={() => navigate("/github-repos")}>GitHub Repos</button>
            <button
      className="nav-button bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-200"
      onClick={() => navigate("/sonar-repo")}
    >
      View Sonar Reports
    </button>
    <button
      className="nav-button bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-200"
      onClick={() => {
        console.log("Navigating to /navbar");
        navigate("/navbar");
      }}
    >
      Documentation
    </button>


            <button className="nav-button outlined">Learn More</button>
            <button className="nav-button logout-button" onClick={handleLogout}>
                Logout
              </button>
          </nav>
        </header>

        <div className="content-grid">
          <div className="card">
            <div className="placeholder"></div>
            <h6 className="card-title">Feature Collaboration</h6>
            <p className="card-text">Collaborate on features with your team seamlessly.</p>
          </div>

          <div className="card-grid">
            <div className="card">
              <div className="placeholder small"></div>
              <h6 className="card-title">Hero</h6>
              <p className="card-text">Your personal development space.</p>
              <button className="card-button">Explore</button>
            </div>

            <div className="card">
              <div className="placeholder small"></div>
              <h6 className="card-title">Team Collaboration</h6>
              <p className="card-text">Work together with your team on projects.</p>
              <button className="card-button">Join Team</button>
            </div>

            <div className="card">
              <div className="placeholder small"></div>
              <h6 className="card-title">Community</h6>
              <p className="card-text">Connect with developers worldwide.</p>
              <button className="card-button">Join Community</button>
            </div>
          </div>

          <div className="card">
            <div className="placeholder"></div>
            <h6 className="card-title">Tools</h6>
            <p className="card-text">Access developer tools and resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;