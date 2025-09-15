"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle,
} from "@mui/icons-material";
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
    case "/settings":
      return "Settings";
    default:
      if (pathname.startsWith("/application/")) return "Car Details";
      if (pathname.startsWith("/users/")) return "User Details";
      if (pathname.startsWith("/chats/")) return "Chat Details";
      return "Admin Panel";
  }
};

export default function TopHeader() {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="large" color="inherit" sx={{ color: "#64748b" }}>
            <SearchIcon />
          </IconButton>

          <IconButton size="large" color="inherit" sx={{ color: "#64748b" }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#3b82f6",
                fontSize: "0.9rem",
              }}
            >
              A
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Avatar /> My account
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
