import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Define the context type
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

 
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorage.getItem("authToken") !== null);
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("authToken"));

  useEffect(() => {
    if (authToken) {
      setIsAuthenticated(true);  
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userEmail", userEmail || "");
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      setIsAuthenticated(false);
    }
  }, [authToken, userEmail]);
  
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserEmail(null);
    
    navigate("/signin");
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
