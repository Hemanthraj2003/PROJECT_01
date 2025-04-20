"use client";
import React from "react";
import { CircularProgress } from "@mui/material";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isLoading,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative z-10 bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <CircularProgress />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
