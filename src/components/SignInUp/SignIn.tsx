import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { SIGN_IN } from "../graphql/mutations";
import sonar from "../../assets/logo.webp";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [signIn] = useMutation(SIGN_IN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await signIn({ variables: { email, password } });
  
      if (data?.signIn) {
        localStorage.setItem("authToken", data.signIn);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };
  

  return (
    <div className="signin-container">
    <div className="signin-form">
      <div className="text-center mb-4">
        <img
          src={sonar}
          alt="SonarHub Logo"
          className="signin-logo"
        />
        <h2 className="mt-3">Sign in to SonarHub</h2>
      </div>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Username or email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <a href="/forgot-password">Forgot password?</a>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="d-grid">
          <button type="submit" className="btn btn-success">
            Sign in
          </button>
        </div>
      </form>
      <div className="text-center mt-3">
        <a href="/signup">New to SonarHub? Create an account.</a>
      </div>
    </div>
    <div className="signin-footer">
      <a href="/terms">Terms</a>
      <a href="/privacy">Privacy</a>
      <a href="/security">Security</a>
      <a href="/contact">Contact SonarHub</a>
    </div>
  </div>
  );
}  