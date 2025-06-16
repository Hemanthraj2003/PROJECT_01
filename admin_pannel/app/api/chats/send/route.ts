import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { handleApiError, logApiRequest, getRequestBody } from "@/lib/utils";

// POST /api/chats/send - Send message to chat
export async function POST(request: NextRequest) {
  logApiRequest(request, "/api/chats/send");

  try {
    const body = await getRequestBody(request);
    const { chatId, messageData, userId } = body;

    if (!chatId) {
      throw new Error("Chat Id is required to send Message.");
    }
    if (!messageData) {
      throw new Error("Message data is required to send the message...");
    }
    if (!messageData.message || !messageData.sentBy || !messageData.timeStamp) {
      throw new Error(
        "Message data should contain message, sentBy and timeStamp..."
      );
    }

    const chatRef = db.collection("CHATS").doc(chatId);
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }
    const chatData = chatDoc.data();

    // Verify that the user sending the message is the owner of the chat
    // This is a security check to prevent users from sending messages in other users' chats
    let shouldUpdateUserId = false;
    if (
      userId &&
      messageData.sentBy === "user" &&
      chatData?.userId !== userId
    ) {
      console.log(
        `User ID mismatch: Request userId=${userId}, Chat userId=${chatData?.userId}`
      );
      // If there's a mismatch, update the chat's userId to match the current user
      // This fixes any existing chats that might have incorrect userIds
      console.log(
        `Updating chat ${chatId} userId from ${chatData?.userId} to ${userId}`
      );
      shouldUpdateUserId = true;
    }

    let updatedChatData: any = {
      ...chatData,
      messages: [messageData, ...(chatData?.messages || [])],
      lastMessageAt: messageData.timeStamp,
    };

    // Update the userId if needed
    if (shouldUpdateUserId && userId) {
      updatedChatData.userId = userId;
    }

    if (messageData.sentBy === "user") {
      updatedChatData.readByAdmin = false;
      updatedChatData.readByUser = true;
    }
    if (messageData.sentBy === "admin") {
      console.log("trying to set the admin message...");
      updatedChatData.readByUser = false;
      updatedChatData.readByAdmin = true;
    }

    await chatRef.update(updatedChatData);

    return NextResponse.json(
      {
        success: true,
        message: "Message Sent Successfully",
        data: updatedChatData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error sending messages",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
