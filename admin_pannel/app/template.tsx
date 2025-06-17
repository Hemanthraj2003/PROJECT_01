"use client";
import React from "react";
import { useAuth } from "./context/authContext";
import { useRouter } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return <>{children}</>;
}
