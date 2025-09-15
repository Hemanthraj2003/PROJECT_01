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
  Refresh as RefreshIcon,
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

  // Function to notify sidebar of read status changes
  const notifySidebarUpdate = () => {
    // Dispatch custom event to trigger sidebar refresh
    window.dispatchEvent(new CustomEvent("chatReadStatusChanged"));
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchChats(true);
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Fetch all chats
  useEffect(() => {
    fetchChats();

    // Remove auto-refresh polling, only keep read status event updates
    // const interval = setInterval(() => fetchChats(true), 10000);
    // return () => clearInterval(interval);
  }, []); // Fetch car details when chat is selected and scroll to bottom
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

      // Update selected chat if it exists in the new data - preserve scroll position
      if (selectedChat) {
        const updatedSelectedChat = response.data.find(
          (chat) => chat.id === selectedChat.id
        );
        if (updatedSelectedChat) {
          // Only update if there are actual changes to prevent unnecessary re-renders
          if (
            JSON.stringify(updatedSelectedChat) !== JSON.stringify(selectedChat)
          ) {
            setSelectedChat(updatedSelectedChat);
          }
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

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    // Mark as read immediately with API call
    if (!chat.readByAdmin) {
      await markAsRead(chat.id);
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

      // Immediately notify sidebar of the change
      notifySidebarUpdate();

      // Call dedicated API endpoint to mark as read
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API + `/chats/${chatId}/mark-read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              readByAdmin: true,
              calledBy: "admin",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark as read");
        }

        // Refresh chats to get updated status from server
        setTimeout(() => {
          fetchChats(true);
          notifySidebarUpdate(); // Notify sidebar to refresh badge
        }, 1000);
      } catch (apiError) {
        console.error("Error marking chat as read via API:", apiError);

        // Fallback: try using the existing getChatById method
        try {
          await chatService.getChatById(chatId);
          // Refresh chats after fallback
          setTimeout(() => {
            fetchChats(true);
            notifySidebarUpdate(); // Notify sidebar to refresh badge
          }, 1000);
        } catch (fallbackError) {
          console.error("Fallback API call also failed:", fallbackError);
          // Revert local state if both API calls fail
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
      }
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageToSend = message.trim();

    try {
      showLoading("Sending message...");

      const newMessage: ChatMessage = {
        sentBy: "admin",
        message: messageToSend,
        timeStamp: new Date().toISOString(),
      };

      // Update local state immediately for better UX
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

      // Send to API
      await chatService.sendMessage(selectedChat.id, messageToSend);

      // Refresh chats to get updated data from server
      setTimeout(() => {
        fetchChats(true);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);

      // Revert local state if API call fails
      setChats((prev) =>
        prev.map((chat) => (chat.id === selectedChat.id ? selectedChat : chat))
      );
      setSelectedChat(selectedChat);
      setMessage(messageToSend); // Restore the message

      // Show error to user
      alert("Failed to send message. Please try again.");
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
                <div className="flex items-center gap-2">
                  {refreshing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                  <IconButton
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    size="small"
                    className={`text-blue-600 hover:bg-blue-50 ${
                      refreshing ? "opacity-50" : ""
                    }`}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </div>
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
                {/* Combined Person and Car Details */}
                {carDetails && (
                  <div className="bg-white p-4 rounded border border-slate-200">
                    <div className="flex gap-4 h-32">
                      {/* Car Image - Left */}
                      <div className="flex-shrink-0 h-full">
                        {carDetails.images && carDetails.images.length > 0 ? (
                          <img
                            src={carDetails.images[0]}
                            alt={`${carDetails.carBrand} ${carDetails.carModel}`}
                            className="w-32 h-full object-cover rounded-lg border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                (
                                  e.currentTarget
                                    .nextElementSibling as HTMLElement
                                ).style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        {/* Fallback placeholder */}
                        <div
                          className="w-32 h-full bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center"
                          style={{
                            display:
                              carDetails.images && carDetails.images.length > 0
                                ? "none"
                                : "flex",
                          }}
                        >
                          <CarIcon sx={{ fontSize: 48, color: "#94a3b8" }} />
                        </div>
                      </div>

                      {/* Car Details - Middle */}
                      <div className="flex-1 min-w-0 h-full flex flex-col justify-between px-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Typography
                            variant="h6"
                            className="font-semibold text-gray-800"
                          >
                            {carDetails.carBrand} {carDetails.carModel}
                          </Typography>
                          <Chip
                            size="small"
                            label={carDetails.carStatus}
                            color={
                              carDetails.carStatus === "approved"
                                ? "success"
                                : carDetails.carStatus === "rejected"
                                ? "error"
                                : "warning"
                            }
                            variant="filled"
                            className="text-xs"
                          />
                        </div>

                        <div className="flex-1 space-y-2 text-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="font-medium text-gray-700">
                                Price:
                              </span>
                              <div className="text-green-600 font-semibold">
                                ₹{carDetails.exceptedPrice?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Year:
                              </span>
                              <div className="text-gray-600">
                                {carDetails.modelYear}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                KM:
                              </span>
                              <div className="text-gray-600">
                                {carDetails.km?.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="font-medium text-gray-700">
                                Fuel:
                              </span>
                              <div className="text-gray-600 capitalize">
                                {carDetails.fuelType}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">
                                Location:
                              </span>
                              <div className="text-gray-600">
                                {carDetails.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Person Info - Right */}
                      <div className="flex-shrink-0 h-full flex flex-col justify-center pl-4 border-l border-slate-200">
                        <div className="flex items-center gap-3">
                          <Avatar
                            sx={{ width: 48, height: 48, bgcolor: "#3b82f6" }}
                          >
                            {selectedChat.userName?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </Avatar>
                          <div>
                            <Typography
                              variant="h6"
                              className="font-semibold text-gray-800"
                            >
                              {selectedChat.userName || "Unknown User"}
                            </Typography>
                            <div className="flex items-center gap-1 mt-1">
                              <PhoneIcon
                                sx={{ fontSize: 14, color: "#6b7280" }}
                              />
                              <Typography
                                variant="body2"
                                className="text-gray-500 text-sm"
                              >
                                {selectedChat.userPhone || "No phone"}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                {selectedChat.messages
                  .slice()
                  .reverse()
                  .map((msg, index) => (
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
