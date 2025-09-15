"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  Badge,
  Chip,
  Divider,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useLoading } from "../context/loadingContext";
import {
  chatService,
  type Chat,
  type ChatMessage,
} from "../services/chatService";
import { carService, type CarData } from "../services/carService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ModernChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [carDetails, setCarDetails] = useState<CarData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  // Ref for auto-scrolling to latest message
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or chat is selected
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Fetch all chats
  useEffect(() => {
    fetchChats();

    // Auto-refresh chats every 30 seconds to update read status
    const interval = setInterval(() => fetchChats(true), 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch car details when chat is selected and scroll to bottom
  useEffect(() => {
    if (selectedChat) {
      fetchCarDetails(selectedChat.carId);
      // Scroll to bottom when a new chat is selected
      setTimeout(scrollToBottom, 100); // Small delay to ensure DOM is updated
    }
  }, [selectedChat]);

  const fetchChats = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await chatService.getAllChats(1, 100);
      setChats(response.data);

      // Update selected chat if it exists in the new data
      if (selectedChat) {
        const updatedSelectedChat = response.data.find(
          (chat) => chat.id === selectedChat.id
        );
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }

      // Auto-select first chat if available and no chat is selected
      if (response.data.length > 0 && !selectedChat) {
        setSelectedChat(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const fetchCarDetails = async (carId: string) => {
    try {
      const car = await carService.getCarById(carId);
      setCarDetails(car);
    } catch (error) {
      console.error("Error fetching car details:", error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark as read
    if (!chat.readByAdmin) {
      markAsRead(chat.id);
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      // Update local state immediately for better UX
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, readByAdmin: true } : chat
        )
      );

      if (selectedChat?.id === chatId) {
        setSelectedChat((prev) =>
          prev ? { ...prev, readByAdmin: true } : null
        );
      }

      // Call API to mark as read - implement proper API endpoint
      try {
        await chatService.getChatById(chatId); // This triggers the read status update on backend
      } catch (apiError) {
        console.error("Error marking chat as read via API:", apiError);
        // Revert local state if API call fails
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, readByAdmin: false } : chat
          )
        );
        if (selectedChat?.id === chatId) {
          setSelectedChat((prev) =>
            prev ? { ...prev, readByAdmin: false } : null
          );
        }
      }
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      showLoading("Sending message...");

      const newMessage: ChatMessage = {
        sentBy: "admin",
        message: message.trim(),
        timeStamp: new Date().toISOString(),
      };

      // Update local state immediately
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
        lastMessageAt: new Date().toISOString(),
      };

      setSelectedChat(updatedChat);
      setChats((prev) =>
        prev.map((chat) => (chat.id === selectedChat.id ? updatedChat : chat))
      );

      setMessage("");

      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100);

      // Send to API (implement this in your chatService)
      // await chatService.sendMessage(selectedChat.id, message.trim(), "admin");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      hideLoading();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Typography>Loading chats...</Typography>
      </Box>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] overflow-hidden">
      <Grid container spacing={2} className="h-full max-h-full">
        {/* Chat List - Left Panel */}
        <Grid item xs={12} md={4}>
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="font-semibold">
                    Conversations ({chats.length})
                  </Typography>
                  <Typography variant="body2" className="text-slate-500">
                    {chats.filter((c) => !c.readByAdmin).length} unread
                  </Typography>
                </div>
                {refreshing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
            </div>

            <List
              sx={{
                flex: 1,
                overflow: "auto",
                p: 0,
                height: "calc(100vh - 280px)",
                minHeight: "300px",
                maxHeight: "calc(100vh - 280px)",
                paddingBottom: "20px",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "#a8a8a8",
                  },
                },
              }}
            >
              {chats.map((chat) => (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleChatSelect(chat)}
                    selected={selectedChat?.id === chat.id}
                    className={`p-4 border-b border-slate-100 ${
                      selectedChat?.id === chat.id
                        ? "bg-blue-50 border-r-4 border-r-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center w-full gap-4">
                      <Badge
                        variant="dot"
                        color="error"
                        invisible={chat.readByAdmin}
                        sx={{
                          "& .MuiBadge-badge": {
                            width: 8,
                            height: 8,
                            minWidth: 8,
                          },
                        }}
                      >
                        <Avatar
                          sx={{ width: 40, height: 40, bgcolor: "#3b82f6" }}
                        >
                          {chat.userName?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar>
                      </Badge>

                      <div className="flex-1 overflow-hidden">
                        <Typography
                          variant="subtitle2"
                          className={`${
                            chat.readByAdmin ? "font-normal" : "font-semibold"
                          } text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap`}
                        >
                          {chat.userName || "Unknown User"}
                        </Typography>

                        <Typography
                          variant="body2"
                          className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                        >
                          {chat.messages.length > 0
                            ? chat.messages[chat.messages.length - 1].message
                            : "No messages yet"}
                        </Typography>

                        <Typography
                          variant="caption"
                          className="text-gray-400 text-xs"
                        >
                          {dayjs(chat.lastMessageAt).fromNow()}
                        </Typography>
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Chat Detail - Right Panel */}
        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar sx={{ width: 48, height: 48, bgcolor: "#3b82f6" }}>
                    {selectedChat.userName?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <div className="flex-1">
                    <Typography
                      variant="h6"
                      className="font-semibold text-gray-800"
                    >
                      {selectedChat.userName || "Unknown User"}
                    </Typography>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <PhoneIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                        <Typography variant="body2" className="text-gray-500">
                          {selectedChat.userPhone || "No phone"}
                        </Typography>
                      </div>
                      <Chip
                        size="small"
                        label={selectedChat.readByAdmin ? "Read" : "Unread"}
                        color={selectedChat.readByAdmin ? "success" : "warning"}
                        variant="outlined"
                      />
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                {carDetails && (
                  <div className="bg-white p-4 rounded border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CarIcon sx={{ fontSize: 20, color: "#3b82f6" }} />
                      <Typography variant="subtitle2" className="font-semibold">
                        {carDetails.carBrand} {carDetails.carModel}
                      </Typography>
                      <Chip
                        size="small"
                        label={carDetails.carStatus}
                        color={
                          carDetails.carStatus === "approved"
                            ? "success"
                            : "warning"
                        }
                        variant="filled"
                      />
                    </div>
                    <Typography variant="body2" className="text-gray-500">
                      Price: ₹{carDetails.exceptedPrice?.toLocaleString()} •
                      Year: {carDetails.modelYear} • Location:{" "}
                      {carDetails.location}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  p: 2,
                  height: "calc(100vh - 400px)",
                  minHeight: "300px",
                  maxHeight: "calc(100vh - 400px)",
                  paddingBottom: "20px",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: "10px",
                    "&:hover": {
                      background: "#a8a8a8",
                    },
                  },
                }}
              >
                {selectedChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${
                      msg.sentBy === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-lg break-words ${
                        msg.sentBy === "admin"
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-gray-800"
                      }`}
                    >
                      <Typography variant="body2" className="break-words">
                        {msg.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        className={`text-xs mt-1 block ${
                          msg.sentBy === "admin"
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {dayjs(msg.timeStamp).format("HH:mm")}
                      </Typography>
                    </div>
                  </div>
                ))}
                {/* Invisible div for auto-scrolling */}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    multiline
                    maxRows={3}
                  />
                  <IconButton
                    color="primary"
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    sx={{
                      bgcolor: "#3b82f6",
                      color: "white",
                      "&:hover": { bgcolor: "#2563eb" },
                      "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Typography variant="h6" className="mb-2">
                  Select a conversation
                </Typography>
                <Typography variant="body2">
                  Choose a chat from the list to start messaging
                </Typography>
              </div>
            </Card>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
