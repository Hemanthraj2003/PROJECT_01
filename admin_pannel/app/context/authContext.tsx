"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if there's an active session on mount
    const authToken = Cookies.get("adminAuthToken");
    if (authToken) {
      setIsAuthenticated(true);
    } else if (window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // For demo purposes, we'll use hardcoded credentials
      // In production, this should make an API call to validate credentials
      if (username === "admin" && password === "admin123") {
        // Set cookie with 1 day expiration
        Cookies.set("adminAuthToken", "demo-token", { expires: 1 });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    try {
      Cookies.remove("adminAuthToken");
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
