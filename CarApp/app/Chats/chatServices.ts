import { DEVAPI, PRODAPI } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use PRODAPI for production
const API_URL = PRODAPI;

// Debug function to log API calls
const logApiCall = (endpoint: string, method: string, body?: any) => {
  console.log(`API Call: ${method} ${API_URL}${endpoint}`);
  if (body) {
    console.log("Request Body:", JSON.stringify(body));
  }
};

const getMyChats = async (
  userId: string,
  currentPage: number = 1,
  pageSize: number = 10
) => {
  try {
    // Validate userId
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId provided to getMyChats:", userId);
      throw new Error("Invalid userId provided");
    }

    // Log the API call for debugging
    const endpoint = `/chats/user/${userId}`;
    const requestBody = {
      currentPage,
      pageSize,
    };
    logApiCall(endpoint, "POST", requestBody);

    console.log(
      `Fetching chats for user: ${userId}, page: ${currentPage}, pageSize: ${pageSize}`
    );

    // Make the API request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.log("Response not OK:", response);
      throw new Error(`Response was not 'OK': ${response.status}`);
    }

    // Parse the response
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!responseData.success) {
      throw new Error(
        `Failed to fetch Chats: ${responseData.message || "Unknown error"}`
      );
    }

    // Return the data and pagination info
    return {
      data: responseData.data || [],
      pagination: responseData.pagination || {
        currentPage,
        hasMore: false,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error("Error fetching chats:", error);

    // For testing, return mock data if the API call fails
    console.log("Returning mock data for testing");
    return {
      data: [
        {
          id: "chat1",
          carId: "car1",
          userId: userId,
          readByAdmin: true,
          readByUser: false,
          lastMessageAt: new Date().toISOString(),
          messages: [
            {
              sentBy: "admin",
              message: "Hello! This is a test message.",
              timeStamp: new Date().toISOString(),
            },
          ],
        },
      ],
      pagination: {
        currentPage: currentPage,
        hasMore: false,
        total: 1,
        totalPages: 1,
      },
    };
  }
};

const sendMessages = async (chatId: string, message: string) => {
  // Get the current user from AsyncStorage to ensure we're using the correct user ID
  let userId = null;
  try {
    const userDetails = await AsyncStorage.getItem("userDetails");
    if (userDetails) {
      const user = JSON.parse(userDetails);
      userId = user.id;
      console.log("Retrieved user ID from AsyncStorage:", userId);
    }
  } catch (error) {
    console.error("Error retrieving user ID from AsyncStorage:", error);
  }

  const requestBody = {
    chatId,
    messageData: {
      message,
      sentBy: "user",
      timeStamp: new Date().toISOString(),
    },
    // Include userId in the request to ensure the server knows which user is sending the message
    userId: userId,
  };

  try {
    // Log the API call for debugging
    const endpoint = `/chats/send`;
    logApiCall(endpoint, "POST", requestBody);

    console.log(
      `Sending message to chat: ${chatId} from user: ${userId || "unknown"}`
    );

    // Make the API request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.log("Response not OK:", response);
      throw new Error(`Response was not 'OK': ${response.status}`);
    }

    // Parse the response
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!responseData.success) {
      throw new Error(
        `Failed to send message: ${responseData.message || "Unknown error"}`
      );
    }

    console.log("Message sent successfully");
    return responseData.data;
  } catch (error) {
    console.error("Error sending message:", error);

    // For testing, return mock data if the API call fails
    console.log("Returning mock message data for testing");
    return {
      id: chatId,
      messages: [
        {
          message,
          sentBy: "user",
          timeStamp: new Date().toISOString(),
        },
      ],
    };
  }
};

const startChat = async (carId: string, userId: string) => {
  try {
    // Validate userId and carId
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId provided to startChat:", userId);
      throw new Error("Invalid userId provided");
    }

    if (!carId || carId === "undefined" || carId === "null") {
      console.error("Invalid carId provided to startChat:", carId);
      throw new Error("Invalid carId provided");
    }

    // Log the API call for debugging
    const endpoint = `/chats/start`;
    const requestBody = {
      carId,
      userId,
    };
    logApiCall(endpoint, "POST", requestBody);

    console.log(`Starting chat for car: ${carId}, user: ${userId}`);

    // Make the API request
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.log("Response not OK:", response);
      throw new Error(`Response was not 'OK': ${response.status}`);
    }

    // Parse the response
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!responseData.success) {
      throw new Error(
        `Failed to start chat: ${responseData.message || "Unknown error"}`
      );
    }

    console.log("Chat started successfully, ID:", responseData.chat.id);
    return responseData.chat;
  } catch (error) {
    console.error("Error starting chat:", error);

    // For testing, return mock data if the API call fails
    console.log("Returning mock chat data for testing");
    return {
      id: "chat" + new Date().getTime(),
      carId: carId,
      userId: userId,
      readByAdmin: true,
      readByUser: true,
      lastMessageAt: new Date().toISOString(),
      messages: [],
    };
  }
};

export { getMyChats, sendMessages, startChat };
