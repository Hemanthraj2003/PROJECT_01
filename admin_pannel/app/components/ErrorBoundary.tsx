"use client";
import React from "react";
import { Button, Paper, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Paper className="p-8 max-w-lg w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <ErrorOutline color="error" style={{ fontSize: 48 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Something went wrong!
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error.message}
          </Typography>
          <div className="flex gap-4">
            <Button variant="contained" onClick={reset}>
              Try again
            </Button>
            <Button
              variant="outlined"
              onClick={() => (window.location.href = "/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
}
