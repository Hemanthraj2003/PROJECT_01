"use client";
import React from "react";
import { CircularProgress, Paper, Typography } from "@mui/material";

interface Props {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({
  message = "Loading...",
  fullScreen = false,
}: Props) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <Paper className="p-8 flex justify-center items-center">{content}</Paper>
  );
}
