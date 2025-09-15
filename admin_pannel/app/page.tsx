"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from "@mui/material";
import {
  DirectionsCar,
  Person,
  Pending,
  CheckCircle,
  Block,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useLoading } from "./context/loadingContext";

interface DashboardStats {
  totalCars: number;
  totalUsers: number;
  pendingApprovals: number;
  approvedCars: number;
  rejectedCars: number;
  soldCars: number;
}

interface RecentActivity {
  id: string;
  carBrand: string;
  carModel: string;
  carStatus: string;
  postedDate: string;
  ownerName: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { showLoading } = useLoading();
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    approvedCars: 0,
    rejectedCars: 0,
    soldCars: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get all cars without pagination for dashboard stats
      const [carsResponse, usersResponse] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API + "/cars?limit=1000"), // Get more cars for accurate stats
        fetch(process.env.NEXT_PUBLIC_API + "/users?limit=1000"), // Get more users for accurate stats
      ]);

      const [carsData, usersData] = await Promise.all([
        carsResponse.json(),
        usersResponse.json(),
      ]);

      const cars = carsData.success ? carsData.data : [];
      const users = usersData.success ? usersData.data : [];

      // Use the total count from API response if available, otherwise use array length
      const totalCars = carsData.pagination?.total || cars.length;
      const totalUsers = usersData.pagination?.total || users.length;

      const statsData = {
        totalCars: totalCars,
        totalUsers: totalUsers,
        pendingApprovals: cars.filter((car: any) => car.carStatus === "pending")
          .length,
        approvedCars: cars.filter((car: any) => car.carStatus === "approved")
          .length,
        rejectedCars: cars.filter((car: any) => car.carStatus === "rejected")
          .length,
        soldCars: cars.filter((car: any) => car.carStatus === "sold").length,
      };

      // Get recent activity (last 10 cars)
      const sortedCars = [...cars]
        .sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        )
        .slice(0, 10);

      setStats(statsData);
      setRecentActivity(sortedCars);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (path: string, actionName: string) => {
    showLoading(`Loading ${actionName}...`);
    router.push(path);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#64748b" }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Welcome back! Here's what's happening with your car marketplace.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <DirectionsCar sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.totalCars}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                Total Cars
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                All registered vehicles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Person sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.totalUsers}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                Total Users
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                Registered customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.pendingApprovals}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                Pending
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.approvedCars}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                Approved
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                Ready for sale
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <DirectionsCar sx={{ fontSize: 40, opacity: 0.8 }} />
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.soldCars}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                Sold
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                Successfully sold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: "#1e293b" }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<DirectionsCar />}
              onClick={() => handleQuickAction("/cars", "car management")}
              sx={{
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Manage Cars
            </Button>
            <Button
              variant="contained"
              startIcon={<Person />}
              onClick={() => handleQuickAction("/users", "user management")}
              sx={{
                bgcolor: "#10b981",
                "&:hover": { bgcolor: "#059669" },
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Manage Users
            </Button>
            <Button
              variant="outlined"
              startIcon={<Pending />}
              onClick={() =>
                handleQuickAction("/cars?status=pending", "pending approvals")
              }
              sx={{
                borderColor: "#f59e0b",
                color: "#f59e0b",
                "&:hover": { bgcolor: "#fef3c7", borderColor: "#d97706" },
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Review Pending ({stats.pendingApprovals})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Latest car listings and applications
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Car
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Owner
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Posted Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow
                    key={activity.id}
                    sx={{ "&:hover": { bgcolor: "#f9fafb" } }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, color: "#1f2937" }}>
                        {activity.carBrand} {activity.carModel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#6b7280" }}>
                        {activity.ownerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          ...(activity.carStatus === "approved" && {
                            bgcolor: "#dcfce7",
                            color: "#166534",
                          }),
                          ...(activity.carStatus === "rejected" && {
                            bgcolor: "#fee2e2",
                            color: "#dc2626",
                          }),
                          ...(activity.carStatus === "pending" && {
                            bgcolor: "#fef3c7",
                            color: "#92400e",
                          }),
                        }}
                      >
                        {activity.carStatus}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "#6b7280" }}>
                        {new Date(activity.postedDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          router.push(`/application/${activity.id}`)
                        }
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 500,
                          borderColor: "#d1d5db",
                          color: "#374151",
                          "&:hover": {
                            bgcolor: "#f3f4f6",
                            borderColor: "#9ca3af",
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
