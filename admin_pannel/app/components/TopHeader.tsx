"use client";
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { DRAWER_WIDTH } from "./Sidebar";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/cars":
      return "Cars Management";
    case "/users":
      return "Users Management";
    case "/chats":
      return "Chat Support";
    default:
      if (pathname.startsWith("/application/")) return "Car Details";
      if (pathname.startsWith("/users/")) return "User Details";
      if (pathname.startsWith("/chats/")) return "Chat Details";
      return "Admin Panel";
  }
};

export default function TopHeader() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        backgroundColor: "white",
        color: "#1e293b",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {getPageTitle(pathname)}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
