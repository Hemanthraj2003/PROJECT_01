"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useLoading } from "../../context/loadingContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CarData {
  id: string;
  carBrand: string;
  carModel: string;
  exceptedPrice: number;
  carStatus: string;
  postedDate: string;
}

interface UserData {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  onSaleCars: string[];
  boughtCars: string[];
  soldCars: string[];
  likedCars: string[];
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [listedCars, setListedCars] = useState<CarData[]>([]);
  const [boughtCars, setBoughtCars] = useState<CarData[]>([]);
  const [soldCars, setSoldCars] = useState<CarData[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      showLoading("Loading user details...");
      // Fetch user details
      const userResponse = await fetch(`http://localhost:5000/users/${id}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }
      const userData = await userResponse.json();

      if (userData.success) {
        setUser(userData.data);

        // Fetch cars data for each category
        if (userData.data.onSaleCars?.length) {
          await fetchCars(userData.data.onSaleCars, setListedCars);
        }

        if (userData.data.boughtCars?.length) {
          await fetchCars(userData.data.boughtCars, setBoughtCars);
        }

        if (userData.data.soldCars?.length) {
          await fetchCars(userData.data.soldCars, setSoldCars);
        }
      } else {
        throw new Error(userData.message || "Failed to fetch user details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      hideLoading();
    }
  };

  const fetchCars = async (
    carIds: string[],
    setter: (cars: CarData[]) => void
  ) => {
    try {
      const response = await fetch("http://localhost:5000/cars/getMyCars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carsIds: carIds }),
      });
      const data = await response.json();
      if (data.success) {
        setter(data.data);
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
    }
  };

  const renderCarTable = (cars: CarData[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Brand</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cars.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No cars found
              </TableCell>
            </TableRow>
          ) : (
            cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>{car.carBrand}</TableCell>
                <TableCell>{car.carModel}</TableCell>
                <TableCell>₹{car.exceptedPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      car.carStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : car.carStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {car.carStatus.charAt(0).toUpperCase() +
                      car.carStatus.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(car.postedDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (!user) {
    return null; // Loading overlay will be shown by LoadingProvider
  }

  return (
    <div className="p-6">
      {/* User Info Section */}
      <Paper elevation={3} className="p-6 mb-6">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" gutterBottom>
              User Profile
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Name</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{user.name || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Phone</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{user.phone}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">Address</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{user.address || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">City</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{user.city || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="textSecondary">State</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{user.state || "N/A"}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Activity Tabs */}
      <Paper elevation={3} className="p-6">
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="user activity tabs"
        >
          <Tab label={`Listed Cars (${listedCars.length})`} />
          <Tab label={`Bought Cars (${boughtCars.length})`} />
          <Tab label={`Sold Cars (${soldCars.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderCarTable(listedCars)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderCarTable(boughtCars)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderCarTable(soldCars)}
        </TabPanel>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
