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
      const [carsResponse, usersResponse] = await Promise.all([
        fetch("http://localhost:5000/cars"),
        fetch("http://localhost:5000/users"),
      ]);

      const [carsData, usersData] = await Promise.all([
        carsResponse.json(),
        usersResponse.json(),
      ]);

      const cars = carsData.success ? carsData.data : [];
      const users = usersData.success ? usersData.data : [];

      const statsData = {
        totalCars: cars.length,
        totalUsers: users.length,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleQuickAction = (path: string, actionName: string) => {
    showLoading(`Loading ${actionName}...`);
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-blue-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <DirectionsCar className="text-blue-600" />
                <Typography color="textSecondary">Total Cars</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.totalCars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-green-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <Person className="text-green-600" />
                <Typography color="textSecondary">Total Users</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-yellow-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <Pending className="text-yellow-600" />
                <Typography color="textSecondary">Pending</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.pendingApprovals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-green-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                <Typography color="textSecondary">Approved</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.approvedCars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-red-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <Block className="text-red-600" />
                <Typography color="textSecondary">Rejected</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.rejectedCars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card className="bg-purple-50">
            <CardContent>
              <div className="flex items-center gap-2">
                <DirectionsCar className="text-purple-600" />
                <Typography color="textSecondary">Sold</Typography>
              </div>
              <Typography variant="h4" component="h2" className="mt-2">
                {stats.soldCars}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={1} className="p-4 mb-6">
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <div className="flex gap-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleQuickAction("/cars", "car management")}
          >
            View All Cars
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleQuickAction("/users", "user management")}
          >
            Manage Users
          </Button>
        </div>
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={1} className="p-4">
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Car</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {activity.carBrand} {activity.carModel}
                  </TableCell>
                  <TableCell>{activity.ownerName}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(
                        activity.carStatus
                      )}`}
                    >
                      {activity.carStatus.charAt(0).toUpperCase() +
                        activity.carStatus.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(activity.postedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/application/${activity.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
