import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { handleApiError, logApiRequest, getRequestBody } from "@/lib/utils";

// POST /api/chats/user/[userId] - Get user chats
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  logApiRequest(request, `/api/chats/user/${params.userId}`);

  try {
    const { currentPage = 1, pageSize = 10 } = await getRequestBody(request);
    const userId = params.userId;
    const offset = (currentPage - 1) * pageSize;

    const chatsRef = db
      .collection("CHATS")
      .where("userId", "==", userId)
      .where("lastMessageAt", "!=", null);

    if (!currentPage || !pageSize || !userId) {
      throw new Error("CurrentPage, PageSize and UserId are Required...");
    }

    const total = (await chatsRef.count().get()).data().count;
    const totalPages = Math.ceil(total / pageSize);
    const chatsSnapShot = await chatsRef
      .orderBy("lastMessageAt", "desc")
      .limit(pageSize)
      .offset(offset)
      .get();

    const chatsData = chatsSnapShot.docs.map((doc) => doc.data());

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
      {
        success: false,
        message: "Error while fetching chats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
