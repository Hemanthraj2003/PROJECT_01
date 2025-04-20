"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useLoading } from "../context/loadingContext";

interface CarData {
  id: string;
  carBrand: string;
  carModel: string;
  modelYear: number;
  fuelType: string;
  transmissionType: string;
  carStatus: string;
  location: string;
  exceptedPrice: number;
  images: string[];
  km: number;
  ownerName: string;
  description: string;
  postedDate: string;
}

export default function Cars() {
  const router = useRouter();
  const [cars, setCars] = useState<CarData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    status: "",
  });

  // Hardcoded options for now - these could come from an API
  const fuelTypes = ["Petrol", "Diesel", "CNG", "EV", "Hybrid"];
  const statuses = ["pending", "approved", "rejected"];

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      showLoading("Loading cars...");
      const response = await fetch("http://localhost:5000/cars");
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setCars(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch cars");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Failed to fetch cars:", error);
    } finally {
      hideLoading();
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewDetails = (carId: string) => {
    showLoading("Loading car details...");
    router.push(`/application/${carId}`);
  };

  const filteredCars = cars.filter((car) => {
    return (
      (!filters.brand ||
        car.carBrand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.model ||
        car.carModel.toLowerCase().includes(filters.model.toLowerCase())) &&
      (!filters.year || car.modelYear.toString() === filters.year) &&
      (!filters.fuelType || car.fuelType === filters.fuelType) &&
      (!filters.status || car.carStatus === filters.status)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Car Management</h1>

      {/* Filters */}
      <Paper className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <TextField
            label="Brand"
            variant="outlined"
            size="small"
            value={filters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
          />
          <TextField
            label="Model"
            variant="outlined"
            size="small"
            value={filters.model}
            onChange={(e) => handleFilterChange("model", e.target.value)}
          />
          <TextField
            label="Year"
            variant="outlined"
            size="small"
            type="number"
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
          />
          <FormControl size="small">
            <Select
              value={filters.fuelType}
              onChange={(e) => handleFilterChange("fuelType", e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Fuel Types</MenuItem>
              {fuelTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Paper>

      {/* Cars Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Fuel Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No cars found
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.carBrand}</TableCell>
                  <TableCell>{car.carModel}</TableCell>
                  <TableCell>{car.modelYear}</TableCell>
                  <TableCell>{car.fuelType}</TableCell>
                  <TableCell>{car.location}</TableCell>
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
                  <TableCell>₹{car.exceptedPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(car.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
