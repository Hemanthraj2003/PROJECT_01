"use client";

const API_URL = process.env.NEXT_PUBLIC_API;

// Types
export interface ChatMessage {
  sentBy: "admin" | "user";
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

// In-memory cache for user data
const userCache = new Map<string, { name: string; phone: string }>();

// Utility function to handle API responses
async function fetchWithError<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data;
}

// Utility function to get user info with caching
async function getUserInfo(userId: string) {
  try {
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    const data = await fetchWithError<{
      success: boolean;
      data: { name: string; phone: string };
    }>(`${API_URL}/users/${userId}`);

    const userInfo = {
      name: data.data.name,
      phone: data.data.phone,
    };

    userCache.set(userId, userInfo);
    return userInfo;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
}

// Chat Service Implementation
export const chatService = {
  getAllChats: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedChatsResponse> => {
    try {
      const data = await fetchWithError<{
        success: boolean;
        data: Chat[];
        total: number;
        currentPage: number;
        totalPages: number;
      }>(`${API_URL}/chats/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage: page, pageSize: limit }),
        cache: "no-store",
      });

      // Get all unique user IDs
      const userIds = [...new Set(data.data.map((chat) => chat.userId))];

      // Fetch all user info in parallel
      await Promise.all(
        userIds.filter((id) => !userCache.has(id)).map((id) => getUserInfo(id))
      );

      // Enhance chats with user info
      const enhancedChats = data.data.map((chat) => {
        const userInfo = userCache.get(chat.userId);
        return {
          ...chat,
          userName: userInfo?.name || "Unknown User",
          userPhone: userInfo?.phone || "No Phone",
        };
      });

      return {
        data: enhancedChats,
        total: data.total,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      };
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  },

  sendMessage: async (chatId: string, message: string): Promise<Chat> => {
    try {
      const data = await fetchWithError<{ success: boolean; data: Chat }>(
        `${API_URL}/chats/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            message,
            sentBy: "admin",
          }),
          cache: "no-store",
        }
      );

      return data.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  getChatById: async (chatId: string): Promise<Chat> => {
    try {
      const data = await fetchWithError<{ success: boolean; data: Chat }>(
        `${API_URL}/chats/${chatId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calledBy: "admin", // Required parameter for your API
          }),
          cache: "no-store",
        }
      );

      if (!data.data.userName) {
        const userInfo = await getUserInfo(data.data.userId);
        if (userInfo) {
          data.data.userName = userInfo.name;
          data.data.userPhone = userInfo.phone;
        }
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching chat:", error);
      throw error;
    }
  },
};
