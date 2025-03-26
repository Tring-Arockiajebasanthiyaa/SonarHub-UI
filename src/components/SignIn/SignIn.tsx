import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { SIGN_IN } from "../Graphql/Mutations";
import { showToast } from "../Toaster/Toaster";
import { useAuth } from "../../Context/AuthContext";
import sonar from "../../assets/logo.webp";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { FaUser, FaLock } from 'react-icons/fa';

interface SignInFormInputs {
  email: string;
  password: string;
}

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>();
  const navigate = useNavigate();
  const { setIsAuthenticated, setAuthToken, setUserEmail } = useAuth();

  const [signIn] = useMutation(SIGN_IN);

  const handleLogin: SubmitHandler<SignInFormInputs> = async ({
    email,
    password,
  }) => {
    try {
      const { data } = await signIn({ variables: { email, password } });

      if (data?.signIn) {
        localStorage.setItem("authToken", data.signIn);
        localStorage.setItem("userEmail", email);
        
        // Update AuthContext state
        setAuthToken(data.signIn);
        setUserEmail(email);
        setIsAuthenticated(true);

        showToast("User login successful", "success", navigate, "/dashboard");
      } else {
        showToast("Invalid credentials. Please try again.", "error");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      showToast(err.message || "Login failed. Please try again.", "error");
    }
  };

  return (
    <motion.div
      className="signin-container full-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="signin-form"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center mb-4">
          <img src={sonar} alt="SonarHub Logo" className="signin-logo" />
          <h2 className="mt-3">Sign in to SonarHub</h2>
        </div>

        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="mb-3 input-container">
            <FaUser className="input-icon" />
            <input
              type="email"
              className="form-control"
              placeholder="Username or email address"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="mb-3 input-container">
            <FaLock className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <div className="mb-3">
            <a href="/forgot-password" className="text-white text-decoration-none hover-effect">Forgot password?</a>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-success">
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <a href="/signup" className="text-white text-decoration-none hover-effect">New to SonarHub? Create an account.</a>
        </div>
      </motion.div>

      <motion.div
        className="signin-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="/security">Security</a>
        <a href="/contact">Contact SonarHub</a>
      </motion.div>
    </motion.div>
  );
}