"use client";
import React from "react";
import { AuthProvider } from "./context/authContext";
import { LoadingProvider } from "./context/loadingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingProvider>{children}</LoadingProvider>
    </AuthProvider>
  );
}
