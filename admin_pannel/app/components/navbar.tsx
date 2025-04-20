"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useLoading } from "../context/loadingContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { showLoading } = useLoading();

  const navItems = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Cars", path: "/cars", icon: <CarIcon /> },
    { text: "Users", path: "/users", icon: <PersonIcon /> },
  ];

  const handleNavigation = (path: string) => {
    showLoading(`Loading ${path === "/" ? "dashboard" : path.slice(1)}...`);
    router.push(path);
  };

  const handleLogout = () => {
    showLoading("Logging out...");
    logout();
  };

  if (!isAuthenticated || pathname === "/login") {
    return null;
  }

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Cars Hub Admin
        </Typography>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              variant={pathname === item.path ? "contained" : "text"}
              color={pathname === item.path ? "primary" : "inherit"}
            >
              {item.text}
            </Button>
          ))}
        </Box>
        <Button
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="inherit"
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
