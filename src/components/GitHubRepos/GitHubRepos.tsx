import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_REPOSITORIES } from "../graphql/queries";
import apolloGitHubClient from "../graphql/apolloGitHubClient";
import { ApolloProvider } from "@apollo/client";
const GitHubReposComponent: React.FC = () => {
    const [username, setUsername] = useState("");
    const { data, loading, error, refetch } = useQuery(GET_USER_REPOSITORIES, {
      variables: { username },
      skip: !username, // Skip query execution until username is provided
    });
  
    useEffect(() => {
      console.log("GitHub Token:", import.meta.env.VITE_GITHUB_ACCESS_TOKEN);
    }, []);
  
    const handleSearch = () => {
      if (username) refetch(); // Refetch data when searching
    };
  
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-4">GitHub Repositories</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter GitHub Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </button>
        </div>
  
        {loading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error.message}</p>}
  
        <ul className="mt-4">
          {data?.user?.repositories?.nodes.map((repo: any) => (
            <li key={repo.name} className="border p-2 rounded my-2 bg-white">
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                {repo.name}
              </a> - ⭐ {repo.stargazerCount}
            </li>
          ))}
        </ul>
      </div>
    );
  };
// Wrap in ApolloProvider
const GitHubRepos: React.FC = () => {
  return (
    <ApolloProvider client={apolloGitHubClient}>
      <GitHubReposComponent />
    </ApolloProvider>
  );
};

export default GitHubRepos;