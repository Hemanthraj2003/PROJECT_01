"use client";
import React from "react";
import { useAuth } from "./context/authContext";
import { useRouter } from "next/navigation";
import Navbar from "./components/navbar";

export default function Template({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto">{children}</main>
    </div>
  );
}
