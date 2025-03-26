import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  authToken: string | null;
  setIsAuthenticated: (auth: boolean) => void;
  setUserEmail: (email: string) => void;
  setAuthToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authToken);

  useEffect(() => {
    if (authToken) {
      setIsAuthenticated(true);
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userEmail", userEmail || "");

      if (["/signin", "/signup", "/"].includes(location.pathname)) {
        navigate("/dashboard", { replace: true });
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      setIsAuthenticated(false);
    }
  }, [authToken]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setAuthToken(null);
    setUserEmail(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, authToken, setIsAuthenticated, setUserEmail, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
