import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "./SetPassword.css";
import "bootstrap/dist/css/bootstrap.min.css";
import sonar from "../../assets/logo.webp";

// GraphQL Mutation for setting password
const SET_PASSWORD = gql`
  mutation SetPassword($email: String!, $password: String!) {
  setPassword(email: $email, password: $password)
}

`;

// GraphQL Mutation for sending password change email
const SEND_PASSWORD_CHANGE_EMAIL = gql`
  mutation SendPasswordChangeEmail($email: String!) {
    sendPasswordChangeEmail(email: $email)
  }
`;

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [setPasswordMutation] = useMutation(SET_PASSWORD);
  const [sendPasswordChangeEmail] = useMutation(SEND_PASSWORD_CHANGE_EMAIL);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents form refresh

    try {
      // Call GraphQL mutation to set password
      const { data } = await setPasswordMutation({ variables: { email, password } });

      if (data?.setPassword) { 
        alert(data.setPassword);      

        // ✅ Ensure the email is sent before navigating
        await sendPasswordChangeEmail({ variables: { email } });

        navigate("/signin"); // ✅ Redirect to login page
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <div className="top-right-button">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn btn-sm btn-secondary"
        >
          Go Back
        </button>
      </div>
      <div className="signin-form">
        <div className="text-center mb-4">
          <img src={sonar} alt="SonarHub Logo" className="signin-logo" />
          <h2 className="mt-3">Set Your Password</h2>
        </div>
        <form onSubmit={handleSetPassword}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-success">
              Set Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
