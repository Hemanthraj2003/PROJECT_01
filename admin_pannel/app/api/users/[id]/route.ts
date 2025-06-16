import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest } from '@/lib/utils';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logApiRequest(request, `/api/users/${params.id}`);
  
  try {
    const { id } = params;

    const userDoc = await db.collection("USERS").doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
