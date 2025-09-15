"use client";
import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useLoading } from "../context/loadingContext";
import { chatService } from "../services/chatService";

const DRAWER_WIDTH = 280;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { showLoading } = useLoading();
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Cars Management", path: "/cars", icon: <CarIcon /> },
    { text: "Users Management", path: "/users", icon: <PersonIcon /> },
    {
      text: "Chat Support",
      path: "/chats",
      icon: <ForumIcon />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { text: "Settings", path: "/settings", icon: <SettingsIcon /> },
  ];

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const chats = await chatService.getAllChats(1, 1000); // Get all chats
        const unread = chats.data.filter((chat) => !chat.readByAdmin).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    if (isAuthenticated) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNavigation = (path: string) => {
    const pageName = path === "/" ? "dashboard" : path.slice(1);
    showLoading(`Loading ${pageName}...`);
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
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#1e293b",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%" }}>
        {/* Header */}
        <Box
          sx={{ p: 3, textAlign: "center", borderBottom: "1px solid #334155" }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: "#3b82f6",
              mx: "auto",
              mb: 2,
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            A
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
            Cars Hub Admin
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
          >
            Administrator Panel
          </Typography>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mx: 2,
                    borderRadius: 2,
                    backgroundColor: isActive ? "#3b82f6" : "transparent",
                    color: isActive ? "white" : "#cbd5e1",
                    "&:hover": {
                      backgroundColor: isActive ? "#2563eb" : "#334155",
                    },
                    "& .MuiListItemIcon-root": {
                      color: isActive ? "white" : "#94a3b8",
                      minWidth: 40,
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.badge ? (
                      <Badge
                        badgeContent={item.badge}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.75rem",
                            minWidth: "18px",
                            height: "18px",
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout Button */}
        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ borderColor: "#334155", mb: 2 }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "#ef4444",
              "&:hover": {
                backgroundColor: "#334155",
              },
              "& .MuiListItemIcon-root": {
                color: "#ef4444",
                minWidth: 40,
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                "& .MuiListItemText-primary": {
                  fontSize: "0.9rem",
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
