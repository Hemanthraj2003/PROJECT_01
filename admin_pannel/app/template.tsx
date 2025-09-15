"use client";
import React from "react";
import { useAuth } from "./context/authContext";
import { useRouter, usePathname } from "next/navigation";
import { Box, CssBaseline, CircularProgress } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "./components/Sidebar";
import TopHeader from "./components/TopHeader";

export default function Template({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If on login page, render without sidebar
  if (pathname === "/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // If not authenticated and not on login page, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <CssBaseline />
      <Sidebar />
      <TopHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px", // Height of the top header
          p: 2, // Standard padding
          backgroundColor: "#f8fafc",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
