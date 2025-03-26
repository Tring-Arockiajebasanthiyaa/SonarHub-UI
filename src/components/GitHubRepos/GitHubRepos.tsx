import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_REPOSITORIES } from "../Graphql/Queries";
import apolloGitHubClient from "../Graphql/ApolloGitHubClient";
import { ApolloProvider } from "@apollo/client";
import "./GitHubRepo.css"
const GitHubReposComponent: React.FC = () => {
  const [username, setUsername] = useState("");
  const { data, loading, error, refetch } = useQuery(GET_USER_REPOSITORIES, {
    variables: { username },
    skip: !username,
  });

  useEffect(() => {
    console.log("GitHub Token:", import.meta.env.VITE_GITHUB_ACCESS_TOKEN);
  }, []);

  const handleSearch = () => {
    if (username) refetch();
  };

  return (
    <div className="github-repos-container">
      <h2 className="github-repos-title text-center">GitHub Repositories</h2>
      <div className="github-search-container">
        <input
          type="text"
          placeholder="Enter GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="github-search-input"
        />
        <button onClick={handleSearch} className="github-search-button">
          Search
        </button>
      </div>

      {loading && <p className="github-loading">Loading...</p>}
      {error && <p className="github-error">{error.message}</p>}

      <ul className="github-repos-list">
        {data?.user?.repositories?.nodes.map((repo: any) => (
          <li key={repo.name} className="github-repo-item">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="github-repo-link"
            >
              {repo.name}
            </a>{" "}
            - ⭐ {repo.stargazerCount}
          </li>
        ))}
      </ul>
    </div>
  );
};

const GitHubRepos: React.FC = () => {
  return (
    <ApolloProvider client={apolloGitHubClient}>
      <GitHubReposComponent />
    </ApolloProvider>
  );
};

export default GitHubRepos;