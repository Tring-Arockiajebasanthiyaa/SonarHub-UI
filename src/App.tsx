import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./components/graphql/apollo-client";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignInUp/SignUp";
import Dashboard from "./components/Dashboard/Dashboard";
import LandingPage from "./components/LandingPage/LandingPage";
import SetPassword from "./components/SetPassword/SetPassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import GitHubRepos from "./components/GitHubRepos/GitHubRepos";
import RepoDetails from "./components/RepoDetails/RepoDetails";
import SonarRepo from "./components/SonarRepo/SonarRepo";
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import { AuthProvider, useAuth } from "./context/AuthContext"; 

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default function App() {
  return (
    <ApolloProvider client={client}>
  <Router>
    <AuthProvider>  
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="github-repos" element={<GitHubRepos />} />
              <Route path="sonar-repo" element={<SonarRepo />} />
              <Route path="repo/:repoName" element={<RepoDetails />} />
            </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
</ApolloProvider>

  );
}
