import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// POST /api/chats/admin - Get all chats (admin)
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/chats/admin');
  
  try {
    const { currentPage = 1, pageSize = 10 } = await getRequestBody(request);
    const offset = (currentPage - 1) * pageSize;

    const chatsRef = db.collection("CHATS").where("lastMessageAt", "!=", null);
    const total = (await chatsRef.count().get()).data().count;

    const chatsSnapShot = await chatsRef
      .orderBy("lastMessageAt", "desc")
      .limit(pageSize)
      .offset(offset)
      .get();

    if (chatsSnapShot.empty) {
      return NextResponse.json(
        { success: false, message: "No chats found" },
        { status: 200 }
      );
    }

    const chatsData = chatsSnapShot.docs.map((doc) => doc.data());
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        success: true,
        data: chatsData,
        pagination: {
          total,
          currentPage,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error while fetching chats" },
      { status: 400 }
    );
  }
}
