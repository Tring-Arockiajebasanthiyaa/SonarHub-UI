import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import sonar from "../../assets/logo.webp";
import {FORGOT_PASSWORD,RESET_PASSWORD} from "../graphql/mutations";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email"); // "email" | "password"
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [forgotPassword] = useMutation(FORGOT_PASSWORD);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await forgotPassword({ variables: { email } });
  
      setMessage(data.forgotPassword);
      setStep("password"); 
  
      
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    }
  };
  

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    const token = localStorage.getItem("authToken"); // Retrieve token
  
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
  
    try {
      const { data } = await resetPassword({
        variables: { token, newPassword },
      });
  
      setMessage("Password reset successful. Redirecting...");
      setError("");
      localStorage.removeItem("authToken");
  
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    }
  };
  
  return (
    <div className="signin-container">
    <div className="signin-form">
      <div className="text-center mb-4">
        <img
          src={sonar} 
          alt="Logo"
          className="signin-logo"
        />
        <h2 className="mt-3">
          {step === "email" ? "Forgot Password" : "Set New Password"}
        </h2>
      </div>
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <div className="d-grid">
            <button type="submit" className="btn btn-success">
              Send Reset Link
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <div className="d-grid">
            <button type="submit" className="btn btn-success">
              Set Password
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
  );
}
