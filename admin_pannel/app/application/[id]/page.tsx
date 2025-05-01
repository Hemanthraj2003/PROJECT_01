"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Paper,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useLoading } from "../../context/loadingContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CarDetails {
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
  registrationNumber: string;
  phoneNumber: string;
}

export default function CarDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarDetails | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      showLoading("Loading car details...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/cars/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch car details: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setCar(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch car details");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch car details",
        severity: "error",
      });
    } finally {
      hideLoading();
    }
  };

  const updateCarStatus = async (
    newStatus: "approved" | "rejected" | "sold"
  ) => {
    try {
      showLoading(
        `${
          newStatus === "approved"
            ? "Approving"
            : newStatus === "rejected"
            ? "Rejecting"
            : "Marking as sold"
        } car...`
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/cars/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCar((prev) => (prev ? { ...prev, carStatus: newStatus } : null));
        setSnackbar({
          open: true,
          message: `Car successfully ${newStatus}`,
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to update status",
        severity: "error",
      });
    } finally {
      hideLoading();
    }
  };

  if (!car) {
    return null; // Loading overlay will be shown by LoadingProvider
  }

  return (
    <>
      <Paper elevation={3} className="m-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Car Details</h1>
          <div className="flex gap-3">
            <Button
              variant="contained"
              color="success"
              onClick={() => updateCarStatus("approved")}
              disabled={
                car.carStatus === "approved" || car.carStatus === "sold"
              }
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => updateCarStatus("rejected")}
              disabled={
                car.carStatus === "rejected" || car.carStatus === "sold"
              }
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => updateCarStatus("sold")}
              disabled={
                car.carStatus === "sold" || car.carStatus === "rejected"
              }
            >
              Mark as Sold
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              car.carStatus === "approved"
                ? "bg-green-100 text-green-800"
                : car.carStatus === "rejected"
                ? "bg-red-100 text-red-800"
                : car.carStatus === "sold"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {car.carStatus.toUpperCase()}
          </span>
        </div>

        {/* Image Carousel */}
        <div className="mb-8">
          <Swiper
            className="w-full max-w-2xl mx-auto"
            slidesPerView={1}
            navigation
            modules={[Navigation, Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            {car.images?.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`${car.carBrand} ${car.carModel}`}
                  className="w-full h-[400px] object-cover rounded"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Car Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Brand</p>
                <p className="font-medium">{car.carBrand}</p>
              </div>
              <div>
                <p className="text-gray-600">Model</p>
                <p className="font-medium">{car.carModel}</p>
              </div>
              <div>
                <p className="text-gray-600">Year</p>
                <p className="font-medium">{car.modelYear}</p>
              </div>
              <div>
                <p className="text-gray-600">Registration</p>
                <p className="font-medium">{car.registrationNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Fuel Type</p>
                <p className="font-medium">{car.fuelType}</p>
              </div>
              <div>
                <p className="text-gray-600">Transmission</p>
                <p className="font-medium">{car.transmissionType}</p>
              </div>
              <div>
                <p className="text-gray-600">Kilometers</p>
                <p className="font-medium">{car.km.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-gray-600">Price</p>
                <p className="font-medium">
                  ₹{car.exceptedPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{car.ownerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{car.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium">{car.location}</p>
              </div>
              <div>
                <p className="text-gray-600">Posted Date</p>
                <p className="font-medium">
                  {new Date(car.postedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
        </div>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
