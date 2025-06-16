import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getQueryParams } from '@/lib/utils';

// GET /api/users/isExists - Check if user exists by phone
export async function GET(request: NextRequest) {
  logApiRequest(request, '/api/users/isExists');
  
  try {
    const query = getQueryParams(request);
    const { phone } = query;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Missing phone" },
        { status: 400 }
      );
    }

    const usersRef = db.collection("USERS");
    const querySnapshot = await usersRef.where("phone", "==", phone).get();
    console.log("results", querySnapshot);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      console.log("True");

      return NextResponse.json(
        { success: true, isExists: true, data: userData },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: true, isExists: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Error checking user existence" },
      { status: 500 }
    );
  }
}
