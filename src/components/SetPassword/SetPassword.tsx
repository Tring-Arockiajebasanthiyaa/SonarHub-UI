import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "./SetPassword.css";
import "bootstrap/dist/css/bootstrap.min.css";
import sonar from "../../assets/logo.webp";
import { SET_PASSWORD, SEND_PASSWORD_CHANGE_EMAIL } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [setPasswordMutation] = useMutation(SET_PASSWORD);
  const [sendPasswordChangeEmail] = useMutation(SEND_PASSWORD_CHANGE_EMAIL);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await setPasswordMutation({
        variables: { email, password },
      });
      if (data?.setPassword) {
        alert(data.setPassword);
        await sendPasswordChangeEmail({ variables: { email } });
        navigate("/signin");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      className="d-flex align-items-center justify-content-center vh-100 position-relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="position-absolute top-0 b-0 m-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn btn-sm btn-secondary text-center text-dark"
        >
          Go Back
        </button>
      </motion.div>
      <motion.div
        className="signin-form p-4 rounded shadow"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center mb-4">
          <img src={sonar} alt="SonarHub Logo" className="signin-logo mb-3" />
          <h2 className="text-dark">Set Your Password</h2>
        </div>
        <form onSubmit={handleSetPassword}>
          <div className="mb-3 input-container">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 input-container">
            <FaLock className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-success">
              Set Password
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}