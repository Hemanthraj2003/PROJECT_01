"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLoading } from "../context/loadingContext";
import { chatService, type Chat } from "../services/chatService";
import {
  Paper,
  Grid,
  Typography,
  Badge,
  TablePagination,
  Skeleton,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Message as MessageIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setChats([]); // Clear existing chats while loading
      const data = await chatService.getAllChats(page + 1, rowsPerPage);
      setChats(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      setError("Failed to load chats. Please try again.");
      setChats([]); // Clear chats on error
    } finally {
      setLoading(false); // Always hide loading state
      hideLoading(); // Hide global loading indicator
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openChat = (chat: Chat) => {
    showLoading("Opening chat...");
    router.push(`/chats/${chat.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chats
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {loading
          ? Array.from(new Array(rowsPerPage)).map((_, index) => (
              <Grid item xs={12} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))
          : chats.map((chat) => (
              <Grid item xs={12} key={chat.id}>
                <Card
                  onClick={() => openChat(chat)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) => theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon color="primary" />
                          <Typography variant="subtitle1">
                            {chat.userName || "Unknown User"}
                          </Typography>
                        </Box>
                        {chat.userPhone && (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mt={1}
                          >
                            <PhoneIcon color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {chat.userPhone}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <MessageIcon color="info" />
                          <Typography variant="body2" noWrap>
                            {chat.messages?.[chat.messages.length - 1]
                              ?.message || "No messages"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box
                          display="flex"
                          justifyContent="flex-end"
                          alignItems="center"
                          gap={1}
                        >
                          <AccessTimeIcon color="action" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(chat.lastMessageAt).fromNow()}
                          </Typography>
                        </Box>
                        {!chat.readByAdmin && (
                          <Box display="flex" justifyContent="flex-end" mt={1}>
                            <Chip
                              label="Unread"
                              color="primary"
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2 }}
      />
    </Box>
  );
}
