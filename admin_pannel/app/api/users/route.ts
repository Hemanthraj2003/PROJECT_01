import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest } from '@/lib/utils';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  logApiRequest(request, '/api/users');
  
  try {
    const usersSnapshot = await db.collection("USERS").get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Error fetching users");
  }
}
