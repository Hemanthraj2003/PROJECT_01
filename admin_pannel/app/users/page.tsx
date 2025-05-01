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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useLoading } from "../context/loadingContext";

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

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      showLoading("Loading users...");
      const response = await fetch(process.env.NEXT_PUBLIC_API + "/users");
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.data) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Failed to fetch users:", error);
    } finally {
      hideLoading();
    }
  };

  const handleViewDetails = (userId: string) => {
    showLoading("Loading user details...");
    router.push(`/users/${userId}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Search Bar */}
      <Paper className="p-4 mb-4">
        <TextField
          fullWidth
          label="Search users by name, phone, or city"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Cars Listed</TableCell>
              <TableCell>Cars Bought</TableCell>
              <TableCell>Cars Sold</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {[user.city, user.state].filter(Boolean).join(", ") ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {user.onSaleCars?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {user.boughtCars?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {user.soldCars?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(user.id)}
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
