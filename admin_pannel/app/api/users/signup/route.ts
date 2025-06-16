import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// POST /api/users/signup - Register new user
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/users/signup');
  
  try {
    const userData = await getRequestBody(request);
    console.log(userData);

    const userRef = await db.collection("USERS").add(userData);

    // Retrieve the user data to send as response
    const newUser = await userRef.get();
    const responseData = { id: newUser.id, ...newUser.data() };
    console.log("After updating the DB: ", responseData);

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Failed to add user" },
      { status: 500 }
    );
  }
}
