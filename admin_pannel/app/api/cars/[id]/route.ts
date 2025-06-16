import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest } from '@/lib/utils';

// GET /api/cars/[id] - Get car by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logApiRequest(request, `/api/cars/${params.id}`);
  
  try {
    const { id } = params;
    const carDoc = await db.collection("CARS").doc(id).get();

    if (!carDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Car not found",
        },
        { status: 404 }
      );
    }

    const carData = {
      id: carDoc.id,
      ...carDoc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: carData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting car:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
