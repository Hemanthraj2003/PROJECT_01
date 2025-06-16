import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest } from '@/lib/utils';

// GET /api/cars/pending - Get all pending cars
export async function GET(request: NextRequest) {
  logApiRequest(request, '/api/cars/pending');
  
  try {
    const pendingCarsSnapShot = await db
      .collection("CARS")
      .where("carStatus", "==", "pending")
      .get();

    if (pendingCarsSnapShot.empty) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No Cars Pending for Approval",
        },
        { status: 200 }
      );
    }

    const pendingCars = pendingCarsSnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { success: true, data: pendingCars },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Error fetching pending cars");
  }
}
