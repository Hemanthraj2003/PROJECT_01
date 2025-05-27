import { DEVAPI, PRODAPI } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const API_URL = PRODAPI;

// Constants for configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 15000;
const MAX_MESSAGE_LENGTH = 1000;

// Common error handler for API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error("SERVER_ERROR"); // Special error type for server errors
    }
    // Handle other error types (400, 401, etc)
    const error = await response.json().catch(() => ({
      message: "Unknown error occurred",
    }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

// Debug function to log API calls
const logApiCall = (endpoint: string, method: string, body?: any) => {
  console.log(`API Call: ${method} ${API_URL}${endpoint}`);
  if (body) {
    console.log("Request Body:", JSON.stringify(body));
  }
};

// Enhanced network check with connection quality
const checkNetworkConnection = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error("No internet connection available");
  }
  if (
    state.isConnected &&
    state.type === "cellular" &&
    state.details?.cellularGeneration === "2g"
  ) {
    throw new Error(
      "Poor network connection. Please check your signal strength."
    );
  }
};

// Enhanced parameter validation with detailed messages
const validateParams = (
  params: Record<string, any>,
  requiredFields: string[]
) => {
  const errors: string[] = [];
  for (const field of requiredFields) {
    if (
      !params[field] ||
      params[field] === "undefined" ||
      params[field] === "null" ||
      (typeof params[field] === "string" && !params[field].trim())
    ) {
      errors.push(`${field} is required`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
};

// Retry mechanism for failed requests
const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries: number = MAX_RETRIES
): Promise<any> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (error instanceof Error) {
        // Don't retry on validation or auth errors
        if (
          error.message.includes("Validation failed") ||
          error.message.includes("session") ||
          error.message.includes("auth")
        ) {
          throw error;
        }
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * (i + 1))
        );
      }
    }
  }
  throw lastError;
};

// Enhanced message validation
const validateMessage = (message: string) => {
  if (!message?.trim()) {
    throw new Error("Message cannot be empty");
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`
    );
  }
  // Check for potentially harmful content
  const suspiciousPatterns = [/<script>/i, /javascript:/i, /data:/i];
  if (suspiciousPatterns.some((pattern) => pattern.test(message))) {
    throw new Error("Message contains invalid content");
  }
};

const makeRequest = async (endpoint: string, method: string, body?: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await retryRequest(async () => {
      const resp = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      return handleApiResponse(resp);
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
    throw new Error("Request failed. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }
};

const getMyChats = async (
  userId: string,
  currentPage: number = 1,
  pageSize: number = 10
) => {
  try {
    // Validate parameters
    if (!userId?.trim()) {
      throw new Error("Invalid user ID");
    }
    if (currentPage < 1) {
      throw new Error("Invalid page number");
    }
    if (pageSize < 1 || pageSize > 50) {
      throw new Error("Invalid page size");
    }

    // Check network connectivity
    await checkNetworkConnection();
    validateParams({ userId }, ["userId"]);

    const endpoint = `/chats/user/${userId}`;
    const requestBody = { currentPage, pageSize };
    logApiCall(endpoint, "POST", requestBody);

    const responseData = await makeRequest(endpoint, "POST", requestBody);

    // Validate response data structure
    if (!Array.isArray(responseData.data)) {
      throw new Error("Invalid response format from server");
    }

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
    console.error("Error in getMyChats:", error);
    throw error;
  }
};

const sendMessages = async (chatId: string, message: string) => {
  try {
    // Initial validations
    if (!chatId?.trim()) {
      throw new Error("Invalid chat ID");
    }
    validateMessage(message);

    await checkNetworkConnection();
    validateParams({ chatId, message }, ["chatId", "message"]);

    // Validate user session
    let userId: string;
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (!userDetails) {
        throw new Error("User session not found. Please log in again.");
      }

      const parsed = JSON.parse(userDetails);
      userId = parsed.id;
      if (!userId) {
        throw new Error("Invalid user session data");
      }
    } catch (e) {
      throw new Error("Session validation failed. Please log in again.");
    }

    const requestBody = {
      chatId,
      messageData: {
        message: message.trim(),
        sentBy: "user",
        timeStamp: new Date().toISOString(),
      },
      userId,
    };

    const endpoint = `/chats/send`;
    logApiCall(endpoint, "POST", requestBody);

    const responseData = await makeRequest(endpoint, "POST", requestBody);

    // Validate response data
    if (!responseData.data || !responseData.data.messages) {
      throw new Error("Invalid response format from server");
    }

    return responseData.data;
  } catch (error) {
    console.error("Error in sendMessages:", error);
    throw error;
  }
};

const startChat = async (carId: string, userId: string) => {
  try {
    // Initial validations
    if (!carId?.trim()) {
      throw new Error("Invalid car ID");
    }
    if (!userId?.trim()) {
      throw new Error("Invalid user ID");
    }

    await checkNetworkConnection();
    validateParams({ carId, userId }, ["carId", "userId"]);

    const endpoint = `/chats/start`;
    const requestBody = { carId, userId };
    logApiCall(endpoint, "POST", requestBody);

    const responseData = await makeRequest(endpoint, "POST", requestBody);

    // Validate response data
    if (!responseData.chat || !responseData.chat.id) {
      throw new Error("Invalid response format from server");
    }

    return responseData.chat;
  } catch (error) {
    console.error("Error in startChat:", error);
    throw error;
  }
};

export { getMyChats, sendMessages, startChat };
