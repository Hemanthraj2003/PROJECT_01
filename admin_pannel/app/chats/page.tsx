"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLoading } from '../context/loadingContext';
import { chatService, type Chat } from '../services/chatService';
import {
  Paper,
  Grid,
  Typography,
  Badge,
  TablePagination,
} from '@mui/material';
import dayjs from 'dayjs';

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const fetchChats = async () => {
    try {
      showLoading("Loading chats...");
      const data = await chatService.getAllChats(page + 1, rowsPerPage);
      setChats(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchChats();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openChat = (chat: Chat) => {
    router.push(`/chats/${chat.id}`);
  };

  return (
    <div className="m-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Chats
      </Typography>
      
      <Grid container spacing={2}>
        {chats.map((chat: Chat) => (
          <Grid item xs={12} key={chat.id}>
            <Paper 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openChat(chat)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Typography variant="h6" className="mb-1">
                      {chat.userName}
                    </Typography>
                    {!chat.readByAdmin && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <Typography variant="body2" color="textSecondary" className="mb-2">
                    {chat.userPhone}
                  </Typography>
                  <Typography variant="body1" className="line-clamp-1">
                    {chat.messages[0]?.message || 'No messages'}
                  </Typography>
                </div>
                <Typography variant="caption" color="textSecondary">
                  {dayjs(chat.lastMessageAt).format('DD/MM/YYYY HH:mm')}
                </Typography>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {chats.length > 0 && (
        <div className="mt-4">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      )}

      {chats.length === 0 && (
        <Paper className="p-8 text-center">
          <Typography variant="h6" color="textSecondary">
            No chats found
          </Typography>
        </Paper>
      )}
    </div>
  );
}