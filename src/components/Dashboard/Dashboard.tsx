import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER_ACTIVITY, GET_USER } from "../graphql/queries";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";
import moment from "moment";

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
      { title: "Total Commits", data: userActivity.totalCommits || 0 },
      { title: "Last Active", data: moment(userActivity.lastActive).format("MM-DD-YYYY") || "-" },
      { title: "Total Repositories", data: userActivity.totalRepositories || 0 },
      { title: "Total Stars", data: userActivity.totalStars || 0 },
      { title: "Total Forks", data: userActivity.totalForks || 0 },
      { title: "Public Repo Count", data: userActivity.publicRepoCount || 0 },
      { title: "Private Repo Count", data: userActivity.privateRepoCount || 0 },
      { title: "Top Contributed Repo", data: userActivity.topContributedRepo || "-" },
      { title: "Sonar Issues", data: userActivity.sonarIssues || "-" },
      { title: "Issue Percentage (%)", data: userActivity.issuePercentage || "0%" },
      { title: "Danger Level", data: userActivity.dangerLevel || "Low" },
      {
        title: "Languages Used",
        data: (
          <ul className="languages-list">
            {userActivity.languagesUsed?.length > 0 ? (
              userActivity.languagesUsed.map((language: string, index: number) => (
                <li key={index}>{language}</li>
              ))
            ) : (
              <li>-</li>
            )}
          </ul>
        ),
      },
    ],
    [userActivity]
  );

  return (
    <div className="page-content">
      <header className="header">
        <h4 className="header-title">GitHub Activity Dashboard</h4>
      </header>
      <div className="card-grid">
        {githubActivities.map((activity, index) => (
          <div className="card" key={index}>
            <h6 className="card-title">{activity.title}</h6>
            <p className="card-data">{loading ? "Loading..." : activity.data}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
