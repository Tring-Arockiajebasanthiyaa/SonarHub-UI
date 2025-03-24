import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER_ACTIVITY, GET_USER } from "../graphql/queries";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faClock, faBook, faStar, faCode, faShieldAlt, faBug, faFire, faGlobe, faLock } from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) navigate("/signin");
  }, [userEmail, navigate]);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  const [fetchUserActivity, { data, loading }] = useLazyQuery(GET_USER_ACTIVITY);

  useEffect(() => {
    if (userData?.getUserByEmail) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  useEffect(() => {
    if (githubUsername) {
      fetchUserActivity({ variables: { githubUsername } });
    }
  }, [githubUsername, fetchUserActivity]);

  const userActivity = useMemo(() => data?.getUserActivity || {}, [data]);

  const githubActivities = useMemo(
    () => [
      { title: "Total Contributions", data: userActivity.totalCommits || 0, icon: faCodeBranch, color: "#ff7f50" },
      { title: "Last Active", data: moment(userActivity.lastActive).format("MM-DD-YYYY") || "-", icon: faClock, color: "#6495ed" },
      { title: "Repositories Owned", data: userActivity.totalRepositories || 0, icon: faBook, color: "#32cd32" },
      { title: "Stars Earned", data: userActivity.totalStars || 0, icon: faStar, color: "#ffa500" },
      { title: "Total Forks", data: userActivity.totalForks || 0, icon: faCode, color: "#dc143c" },
      { title: "Public Repos", data: userActivity.publicRepoCount || 0, icon: faGlobe, color: "#20b2aa" },
      { title: "Private Repos", data: userActivity.privateRepoCount || 0, icon: faLock, color: "#9370db" },
      { title: "Most Active Repo", data: userActivity.topContributedRepo || "-", icon: faFire, color: "#ff4500" },
      { title: "Code Vulnerabilities", data: userActivity.sonarIssues || "-", icon: faBug, color: "#ff6347" },
      { title: "Issue Rate (%)", data: userActivity.issuePercentage || "0%", icon: faShieldAlt, color: "#4682b4" },
    ],
    [userActivity]
  );

  return (
    <div className="dashboard-container">
      <header className="header">
        <h4 className="header-title text-center">🚀 Developer Performance Dashboard</h4>
      </header>

      {loading ? (
        <div className="spinner-container">
           <ClipLoader color="#58a6ff" size={80} />
        </div>
      ) : (
        <motion.div className="card-grid">
          {githubActivities.map((activity, index) => (
            <motion.div
              className="card"
              key={index}
              style={{ borderColor: activity.color }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FontAwesomeIcon icon={activity.icon} className="card-icon" style={{ color: activity.color }} />
              <h6 className="card-title">{activity.title}</h6>
              <p className="card-data">{activity.data}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
