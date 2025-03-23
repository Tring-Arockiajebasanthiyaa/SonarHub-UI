import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_ACTIVITY, GET_USER } from "../graphql/queries";

const NavBar = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      navigate("/signin");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email },
    skip: !email,
  });

  useEffect(() => {
    if (userData?.getUserByEmail) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);
  console.log(githubUsername);
  const { data, loading, error } = useQuery(GET_USER_ACTIVITY, {
    variables: { githubUsername },
    skip: !githubUsername,
  });

  const totalCommits = useMemo(() => data?.getUserActivity?.totalCommits || 0, [data]);
  const lastActive = useMemo(() => data?.getUserActivity?.lastActive || "Unknown", [data]);
  const totalRepositories = useMemo(() => data?.getUserActivity?.totalRepositories || 0, [data]);
  const totalStars = useMemo(() => data?.getUserActivity?.totalStars || 0, [data]);
  const totalForks = useMemo(() => data?.getUserActivity?.totalForks || 0, [data]);
  const publicRepoCount = useMemo(() => data?.getUserActivity?.publicRepoCount || 0, [data]);
  const privateRepoCount = useMemo(() => data?.getUserActivity?.privateRepoCount || 0, [data]);
  const languagesUsed = useMemo(() => data?.getUserActivity?.languagesUsed?.join(", ") || "N/A", [data]);
  const topContributedRepo = useMemo(() => data?.getUserActivity?.topContributedRepo || "N/A", [data]);
  const earliestRepoCreatedAt = useMemo(() => data?.getUserActivity?.earliestRepoCreatedAt || "N/A", [data]);
  const mostRecentlyUpdatedRepo = useMemo(() => data?.getUserActivity?.mostRecentlyUpdatedRepo || "N/A", [data]);
  const sonarIssues = useMemo(() => data?.getUserActivity?.sonarIssues || "N/A", [data]);
  const issuePercentage = useMemo(() => data?.getUserActivity?.issuePercentage || "0%", [data]);
  const dangerLevel = useMemo(() => data?.getUserActivity?.dangerLevel || "Low", [data]);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <h1 className="text-center my-4">GitHub Activity Dashboard</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
            <h5>Total Commits</h5>
            <p>{totalCommits}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white p-3">
            <h5>Last Active</h5>
            <p>{lastActive}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white p-3">
            <h5>Total Repositories</h5>
            <p>{totalRepositories}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white p-3">
            <h5>Total Stars</h5>
            <p>{totalStars}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white p-3">
            <h5>Total Forks</h5>
            <p>{totalForks}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-white p-3">
            <h5>Public Repositories</h5>
            <p>{publicRepoCount}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white p-3">
            <h5>Private Repositories</h5>
            <p>{privateRepoCount}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light text-dark p-3">
            <h5>Languages Used</h5>
            <p>{languagesUsed}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white p-3">
            <h5>Top Contributed Repo</h5>
            <p>{topContributedRepo}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white p-3">
            <h5>Earliest Repo Created At</h5>
            <p>{earliestRepoCreatedAt}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white p-3">
            <h5>Most Recently Updated Repo</h5>
            <p>{mostRecentlyUpdatedRepo}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white p-3">
            <h5>SonarIssues</h5>
            <p>{sonarIssues}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white p-3">
           <h5>Issue Percentage</h5>
           <p>{issuePercentage}</p>
          </div>
        </div>
        <div className="col-md-4">
           <div className="card bg-dark text-white p-3">
               <h5>Danger Level</h5>
               <p>{dangerLevel}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
