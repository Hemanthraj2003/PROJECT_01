import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// POST /api/chats/[chatId] - Get chat by ID
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  logApiRequest(request, `/api/chats/${params.chatId}`);
  
  try {
    const body = await getRequestBody(request);
    const { calledBy } = body;
    const chatId = params.chatId;

    if (!calledBy) {
      throw new Error("'calledBy' is required to get the chat.");
    }
    
    const chatDoc = await db.collection("CHATS").doc(chatId).get();
    if (!chatDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }

    if (calledBy === "user") {
      await db.collection("CHATS").doc(chatId).update({ readByUser: true });
    } else if (calledBy === "admin") {
      await db.collection("CHATS").doc(chatId).update({ readByAdmin: true });
    }

    const chatData = chatDoc.data();
    return NextResponse.json(
      {
        success: true,
        message: "Chat fetched successfully",
        data: chatData,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching messages",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
