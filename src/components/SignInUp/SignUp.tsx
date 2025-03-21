import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import "./styles.css";

// GraphQL Query to Check Authentication
const CHECK_AUTH = gql`
  query CheckAuth {
    checkAuth {
      isAuthenticated
      user {
        email
        password
      }
      token
    }
  }
`;

// GraphQL Mutation for GitHub Authentication
const GITHUB_AUTH = gql`
  mutation GitHubAuth {
    githubAuth {
      isAuthenticated
      user {
        email
        
      }
      token
    }
  }
`;

export default function SignUp() {
  const navigate = useNavigate();
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // Query to check authentication status
  const { data, loading, error } = useQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  // Mutation to handle GitHub authentication
  const [githubAuth, { data: authData, error: authError }] = useMutation(GITHUB_AUTH);

  useEffect(() => {
    if (data?.checkAuth?.isAuthenticated) {
      localStorage.setItem("authToken", data.checkAuth.token);
      navigate(data.checkAuth.user.password ? "/dashboard" : "/set-password");
    }
  }, [data, navigate]);

  useEffect(() => {
    // Check if the user is redirected back from GitHub
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setIsGitHubLoading(true);
      githubAuth({
        variables: { code },
      })
        .then((response) => {
          if (response.data?.githubAuth?.isAuthenticated) {
            localStorage.setItem("authToken", response.data.githubAuth.token);
            navigate("/dashboard");
          }
        })
        .catch((error) => {
          console.error("GitHub Authentication Error:", error);
        })
        .finally(() => {
          setIsGitHubLoading(false);
        });
    }
  }, [githubAuth, navigate]);

  const handleGitHubSignup = () => {
    const clientId = "Ov23liwVPCtND4vUVfuG"; // Replace with your GitHub OAuth App Client ID
    const redirectUri = "http://localhost:4000/auth/github/callback";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    // Redirect to GitHub's OAuth page
    window.location.href = githubAuthUrl;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading authentication status</p>;

  return (
    <div className="form-container">
      <h1>Sign up to SonarHub</h1>
      {data?.checkAuth?.isAuthenticated ? (
        <p>Welcome, {data.checkAuth.user.displayName}! Redirecting...</p>
      ) : (
        <button
          onClick={handleGitHubSignup}
          className="github-button"
          disabled={isGitHubLoading}
        >
          {isGitHubLoading ? "Signing in with GitHub..." : "Sign up with GitHub"}
        </button>
      )}
      {authError && <p>Error: {authError.message}</p>}
    </div>
  );
}