"use client";
import React, { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function Login() {
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("Admin");
  const [error, setError] = useState("");
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(username, password);
      if (success) {
        router.push("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Paper elevation={3} className="p-8 w-full max-w-md">
          <div className="text-center">
            <Typography variant="h6">Loading...</Typography>
          </div>
        </Paper>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Cars Hub Admin
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="textSecondary"
          className="mb-6"
        >
          Sign in to access the admin panel
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Sign In
          </Button>
        </form>
      </Paper>
    </div>
  );
}
