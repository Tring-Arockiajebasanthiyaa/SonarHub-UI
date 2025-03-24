import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { SIGN_IN } from "../graphql/mutations";
import { showToast } from "../Toaster/Toaster";
import { useAuth } from "../../context/AuthContext";
import sonar from "../../assets/logo.webp";
import "./SignIn.css";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const { setIsAuthenticated } = useAuth();

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
    <div className="signin-container d-flex align-items-center justify-content-center vh-100 bg-dark">
      <div className="signin-form p-4 rounded shadow bg-dark border border-primary">
        <div className="text-center mb-4">
          <img src={sonar} alt="SonarHub Logo" className="signin-logo mb-3" />
          <h2 className="text-white">Sign in to SonarHub</h2>
        </div>

        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control bg-dark text-white border-primary"
              placeholder="Username or email address"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-danger">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control bg-dark text-white border-primary"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-danger">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-3">
            <a href="/forgot-password" className="text-primary">
              Forgot password?
            </a>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-success">
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <a href="/signup" className="text-primary">
            New to SonarHub? Create an account.
          </a>
        </div>
      </div>

      <div className="signin-footer mt-3 text-center text-secondary">
        <a href="/terms" className="mx-2 text-secondary">Terms</a>
        <a href="/privacy" className="mx-2 text-secondary">Privacy</a>
        <a href="/security" className="mx-2 text-secondary">Security</a>
        <a href="/contact" className="mx-2 text-secondary">Contact SonarHub</a>
      </div>
    </div>
  );
}