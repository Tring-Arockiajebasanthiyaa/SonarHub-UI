import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import "./LandingPage.css";
import logo from "../../assets/logo.webp";

const CHECK_AUTH = gql`
  query CheckAuth($onlyStatus: Boolean) {
    checkAuth(onlyStatus: $onlyStatus) {
      isAuthenticated
      user {
        email
      }
      token
    }
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showVideo, setShowVideo] = useState(false); 

  const { data, loading, error } = useQuery(CHECK_AUTH, {
    variables: { onlyStatus: true },
  });

  useEffect(() => {
    if (!loading && !error && data?.checkAuth?.isAuthenticated !== undefined) {
      setIsAuthenticated(data.checkAuth.isAuthenticated);
      if (!data.checkAuth.isAuthenticated) {
        navigate("/", { replace: true });
      }
    }
  }, [loading, error, data?.checkAuth?.isAuthenticated, navigate]);
  

  if (showVideo) {
    return (
      <div className="video-container">
        <button className="btn btn-secondary back-button" onClick={() => setShowVideo(false)}>
          ← Back
        </button>
        <div className="video-wrapper">
          <iframe
            src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=222247089235175"
            width="800"
            height="450"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Watch Video"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <nav className="navbar">
        <img src={logo} alt="SonarHub Logo" className="logo-img" />
        <div className="auth-buttons">
          <Link to="/signin" className="nav-link signin">Sign In</Link>
          <Link to="/signup" className="nav-link signup">Sign Up</Link>
        </div>
      </nav>

      <main className="hero">
        <h1 className="hero-title">STREAMLINE YOUR CODE REVIEWS</h1>
        <h2 className="hero-subtitle">WITH SONARHUB</h2>
        <p className="hero-text">
          Automate code analysis, track PRs, and collaborate efficiently.
          SonarHub enhances your development workflow.
        </p>
        <div className="hero-buttons">
          <button className="watch-video" onClick={() => setShowVideo(true)}>Watch Video</button>
          <button className="get-started" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
