import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import logo from "../../assets/logo.webp"; 

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
  
  const { data, loading, error } = useQuery(CHECK_AUTH, {
    fetchPolicy: "network-only",
  });

  const [githubAuth, { data: authData, error: authError }] = useMutation(GITHUB_AUTH);

  useEffect(() => {
    if (data?.checkAuth?.isAuthenticated) {
      localStorage.setItem("authToken", data.checkAuth.token);
      navigate(data.checkAuth.user.password ? "/dashboard" : "/set-password");
    }
  }, [data, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setIsGitHubLoading(true);
      githubAuth({ variables: { code } })
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
    const clientId = import.meta.env.VITE_CLIENT_ID; 
    const redirectUri = import.meta.env.VITE_BACKEND_AUTH_URL || " ";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  if (loading) return <p className="text-light text-center">Loading...</p>;
  if (error) return <p className="text-danger text-center">Error loading authentication status</p>;

  return (
    <div className="form-container text-center">
      <img src={logo} alt="SonarHub Logo" className="logo" />
      <h1 className="text-light">Sign up to SonarHub</h1>
      {data?.checkAuth?.isAuthenticated ? (
        <p className="text-light">Welcome, {data.checkAuth.user.email}! Redirecting...</p>
      ) : (
        <button
          onClick={handleGitHubSignup}
          className="btn btn-outline-light github-button"
          disabled={isGitHubLoading}
        >
          {isGitHubLoading ? "Signing in with GitHub..." : "Sign up with GitHub"}
        </button>
      )}
      {authError && <p className="text-danger">Error: {authError.message}</p>}
    </div>
  );
}