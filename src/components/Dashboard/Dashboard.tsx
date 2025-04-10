import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { GET_USER_ACTIVITY, GET_USER } from "../Graphql/Queries";
import { useAuth } from "../../Context/AuthContext";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faClock,
  faBook,
  faStar,
  faCode,
  faShieldAlt,
  faBug,
  faFire,
  faGlobe,
  faLock,
  faLanguage,
  faCalendarAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FaGithub} from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import "./Dashboard.css";
import { REQUEST_GITHUB_AUTH } from "../Graphql/Mutations";
import { Button } from "react-bootstrap";

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

  const useActivity = useMemo(() => data?.getUserActivity || {}, [data]);
  const [requestGithubAuth] = useMutation(REQUEST_GITHUB_AUTH);
    const handleGithubLogin = async () => {
      try {
        const { data: authUrlResult } = await requestGithubAuth({
          variables: { username: githubUsername },
        });
    
        const redirectUrl = authUrlResult?.requestGithubAuth?.url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          const message = authUrlResult?.requestGithubAuth?.message || "GitHub auth failed.";
          alert(message);
        }
      } catch (err) {
        console.error("GitHub Auth Error:", err);
        alert("GitHub auth failed.");
      }
    };
  console.log(useActivity);
  console.log(JSON.stringify(useActivity, null, 2));

  const githubActivities = useMemo(
    () => [
      { title: "GitHub Username", data: githubUsername || "-", icon: faCodeBranch, color: "#ff7f50" },
      { title: "Total Repositories", data: useActivity.totalRepositories || 0, icon: faBook, color: "#32cd32" },
      { title: "Total Commits", data: useActivity.totalCommits || 0, icon: faCode, color: "#ff7f50" },
      { title: "Stars Earned", data: useActivity.totalStars || 0, icon: faStar, color: "#ffa500" },
      { title: "Total Forks", data: useActivity.totalForks || 0, icon: faCode, color: "#dc143c" },
      { title: "Public Repos", data: useActivity.publicRepoCount || 0, icon: faGlobe, color: "#20b2aa" },
      { title: "Private Repos", data: useActivity.privateRepoCount || 0, icon: faLock, color: "#9370db" },
      { title: "Languages Used", data: useActivity.languagesUsed?.join(", ") || "-", icon: faLanguage, color: "#ff8c00" },
      { title: "Recently Created Repo", data: useActivity.topContributedRepo || "-", icon: faFire, color: "#ff4500" },
      { title: "Earliest Repo Created", data: moment(useActivity.earliestRepoCreatedAt).format("DD-MM-YYYY") || "-", icon: faCalendarAlt, color: "#8a2be2" },
      { title: "Most Recently Updated Repo", data: moment(useActivity.mostRecentlyUpdatedRepo).format("DD-MM-YYYY") || "-", icon: faClock, color: "#6495ed" },
      { title: "Last Active", data: moment(useActivity.lastActive).format("DD-MM-YYYY") || "-", icon: faClock, color: "#6495ed" },
      { title: "Code Vulnerabilities", data: useActivity.sonarIssues || "-", icon: faBug, color: "#ff6347" },
      { title: "Issue Rate (%)", data: useActivity.issuePercentage || "0%", icon: faShieldAlt, color: "#4682b4" },
      { title: "Danger Level", data: useActivity.dangerLevel || "Low", icon: faExclamationTriangle, color: "#ff0000" },
    ],
    [useActivity, githubUsername]
  );

  return (
    <div className="dashboard-container">
      <header className="header">
        <h4 className="header-title text-center">🚀 Developer Performance Dashboard</h4>
        <div className="text-center">
          <Button variant="dark" className="me-5 mt-3" onClick={handleGithubLogin}>
             <FaGithub className="me-1" />
               Connect GitHub
          </Button>
        </div>
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
