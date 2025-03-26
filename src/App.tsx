import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./components/Graphql/ApolloClient";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import Dashboard from "./components/Dashboard/Dashboard";
import LandingPage from "./components/LandingPage/LandingPage";
import SetPassword from "./components/SetPassword/SetPassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import GitHubRepos from "./components/GitHubRepos/GitHubRepos";
import RepoDetails from "./components/RepoDetails/RepoDetails";
import SonarRepo from "./components/SonarRepo/SonarRepo";
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import LearnMore from "./components/LearnMore/LearnMore";
import { AuthProvider, useAuth } from "./Context/AuthContext"; 

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};


const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>  
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="github-repos" element={<GitHubRepos />} />
                <Route path="sonar-repo" element={<SonarRepo />} />
                <Route path="repo/:repoName" element={<RepoDetails />} />
                <Route path="learn-more" element={<LearnMore />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
}
