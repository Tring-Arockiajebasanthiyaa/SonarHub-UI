import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./components/graphql/apollo-client";
import SignIn from "./components/SignInUp/SignIn";
import SignUp from "./components/SignInUp/SignUp";
import Dashboard from "./components/Dashboard/Dashboard";
import LandingPage from "./components/LandingPage/LandingPage";
import SetPassword from "./components/SignInUp/SetPassword";
import ForgotPassword from "./components/SignInUp/ForgotPassword";
import GitHubRepos from "./components/GitHubRepos/GitHubRepos"; 
import RepoDetails from "./components/RepoDetails/RepoDetails";
import SonarRepo from "./components/SonarRepo/SonarRepo";
import NavBar from "./components/Navbar/NavBar";
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");

    console.log("Checking authentication...");
    console.log("Auth Token:", token);
    console.log("User Email:", email);

    if (token) {
      setIsAuthenticated(true);
      setUserEmail(email || ""); // Ensure email is set properly
    } else {
      setIsAuthenticated(false);
    }
  }, []);  

  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          {/* Wrap GitHubRepos in ApolloProvider with GitHub Client */}
          <Route path="/github-repos" element={<GitHubRepos />} />
          <Route path="/sonar-repo" element={<SonarRepo />} />
          <Route path="/navbar" element={isAuthenticated ? <NavBar /> : <Navigate to="/signin" replace />}/>
          <Route path="/repo/:repoName" element={<RepoDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}
