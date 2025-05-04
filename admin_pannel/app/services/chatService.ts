const API_URL = process.env.NEXT_PUBLIC_API;

export interface ChatMessage {
  sentBy: 'admin' | 'user';
  message: string;
  timeStamp: string;
}

export interface Chat {
  id: string;
  carId: string;
  userId: string;
  readByAdmin: boolean;
  readByUser: boolean;
  lastMessageAt: string;
  messages: ChatMessage[];
  userName?: string;
  userPhone?: string;
}

export interface PaginatedChatsResponse {
  data: Chat[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const chatService = {
  async getAllChats(page: number = 1, limit: number = 10): Promise<PaginatedChatsResponse> {
    try {
      const response = await fetch(`${API_URL}/chats/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPage: page,
          pageSize: limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        const chatsWithUserInfo = await Promise.all(
          data.data.map(async (chat: Chat) => {
            const userResponse = await fetch(`${API_URL}/users/${chat.userId}`);
            const userData = await userResponse.json();
            return {
              ...chat,
              userName: userData.data?.name || 'Unknown User',
              userPhone: userData.data?.phone || 'N/A',
            };
          })
        );

        return {
          data: chatsWithUserInfo,
          total: data.pagination.total,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
        };
      }
      throw new Error(data.message || 'Failed to fetch chats');
    } catch (error) {
      throw error;
    }
  },

  async sendMessage(chatId: string, message: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_URL}/chats/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          messageData: {
            message,
            sentBy: 'admin',
            timeStamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to send message');
    } catch (error) {
      throw error;
    }
  },

  async getChatById(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calledBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chat: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        const userResponse = await fetch(`${API_URL}/users/${data.data.userId}`);
        const userData = await userResponse.json();
        return {
          ...data.data,
          userName: userData.data?.name || 'Unknown User',
          userPhone: userData.data?.phone || 'N/A',
        };
      }
      throw new Error(data.message || 'Failed to fetch chat');
    } catch (error) {
      throw error;
    }
  }
};