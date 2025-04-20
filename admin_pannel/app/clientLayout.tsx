"use client";
import React from "react";
import { AuthProvider } from "./context/authContext";
import { LoadingProvider } from "./context/loadingContext";
import Navbar from "./components/navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LoadingProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto">{children}</main>
        </div>
      </LoadingProvider>
    </AuthProvider>
  );
}
