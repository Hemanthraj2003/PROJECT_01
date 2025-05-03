import { DEVAPI } from "../theme";

const API_URL = DEVAPI;

const getMyChats = async (
  userId: string,
  currentPage: number = 1,
  pageSize: number = 10
) => {
  try {
    const response = await fetch(`${API_URL}/chats/user/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPage,
        pageSize,
      }),
    });

    if (!response.ok) {
      console.log(response);

      throw new Error("Response was not 'OK'");
    }
    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error("Failed to fetch Chats");
    }
    // const data = responseData.data;
    return { data: responseData.data, pagination: responseData.pagination };
  } catch (error) {
    console.log("Error fetching chats:", error);
    return { data: null, pagination: null };
  }
};

const sendMessages = async (chatId: string, message: string) => {
  const requestBody = {
    chatId,
    messageData: {
      message,
      sentBy: "user",
      timeStamp: new Date().toISOString(),
    },
  };
  try {
    const response = await fetch(`${API_URL}/chats/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(" Error sending message");
    }
    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message);
    }
    return responseData.data;
  } catch (error) {
    console.log("Error sending message:", error);
  }
};

export { getMyChats, sendMessages };
