import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody, isChatInitiated } from '@/lib/utils';

// POST /api/chats/start - Start new chat
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/chats/start');
  
  try {
    const body = await getRequestBody(request);
    const { carId, userId } = body;

    if (!carId || !userId) {
      throw new Error("carId and userId are required to start a chat.");
    }

    const { isChat, chat } = await isChatInitiated(db, carId, userId);
    if (isChat) {
      return NextResponse.json(
        {
          success: true,
          message: "Chat already initiated.",
          chat: chat, // this is used as a parameter to get the chat messages
        },
        { status: 200 }
      );
    }

    const newChatRef = db.collection("CHATS").doc();
    const newChat = {
      id: newChatRef.id,
      carId,
      userId,
      messages: [],
      readByUser: true,
      readByAdmin: true,
      lastMessageAt: null,
    };

    await newChatRef.set(newChat);

    return NextResponse.json(
      {
        success: true,
        message: "Chat started successfully.",
        chat: newChat,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Error starting chat");
  }
}
