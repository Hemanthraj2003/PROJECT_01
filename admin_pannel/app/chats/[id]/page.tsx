"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLoading } from '../../context/loadingContext';
import { chatService, type Chat, type ChatMessage } from '../../services/chatService';
import { carService, type CarData } from '../../services/carService';
import {
  Paper,
  TextField,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import dayjs from 'dayjs';

export default function ChatDetail() {
  const { id } = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [car, setCar] = useState<CarData | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showLoading, hideLoading } = useLoading();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatAndCar = async () => {
    try {
      showLoading("Loading chat...");
      const chatData = await chatService.getChatById(id as string);
      setChat(chatData);
      
      const carData = await carService.getCarById(chatData.carId);
      setCar(carData);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchChatAndCar();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const sendMessage = async () => {
    if (!message.trim() || !chat) return;

    try {
      showLoading("Sending message...");
      const updatedChat = await chatService.sendMessage(chat.id, message);
      setChat(updatedChat);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      hideLoading();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chat || !car) return null;

  // Reverse messages array for display
  const displayMessages = [...chat.messages].reverse();

  return (
    <div className="m-6">
      <div className="flex gap-4">
        {/* Chat Section */}
        <div className="flex-1">
          <Paper className="h-[calc(100vh-140px)] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-gray-50 border-b">
              <Typography variant="h6">{chat.userName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {chat.userPhone}
              </Typography>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayMessages.map((msg: ChatMessage, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sentBy === 'admin' ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sentBy === 'admin'
                        ? 'bg-blue-100 rounded-tr-none'
                        : 'bg-gray-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-gray-800">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dayjs(msg.timeStamp).format('HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Paper>
        </div>

        {/* Car Details Sidebar */}
        <div className="w-80">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Car Details
              </Typography>
              <Divider className="mb-4" />
              
              {car.images && car.images[0] && (
                <img
                  src={car.images[0]}
                  alt={`${car.carBrand} ${car.carModel}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <Typography variant="subtitle1" color="primary">
                {car.carBrand} {car.carModel}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Year: {car.modelYear}
              </Typography>
              
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Price: ₹{car.exceptedPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Location: {car.location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Fuel Type: {car.fuelType}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Kilometers: {car.km.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}