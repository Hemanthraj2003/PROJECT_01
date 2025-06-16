import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// PUT /api/users/update - Update user profile
export async function PUT(request: NextRequest) {
  logApiRequest(request, '/api/users/update');
  
  try {
    const { id, ...data } = await getRequestBody(request);

    if (!id) {
      return NextResponse.json(
        { message: "docId is required" },
        { status: 400 }
      );
    }

    const userReference = db.collection("USERS").doc(id);
    await userReference.update(data);
    const userDoc = await userReference.get();
    const userData = { id: userDoc.id, ...userDoc.data() };
    
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
