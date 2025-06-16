import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// POST /api/cars/post - Post car for approval
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/cars/post');
  
  try {
    const carData = await getRequestBody(request);
    const { postedBy } = carData;

    if (!postedBy) {
      return NextResponse.json(
        {
          success: false,
          message: "postedBy (user docId) is required.",
        },
        { status: 400 }
      );
    }

    const carRef = db.collection("CARS").doc();
    await carRef.set(carData);

    const userRef = db.collection("USERS").doc(postedBy);
    await userRef.update({
      onSaleCars: admin.firestore.FieldValue.arrayUnion(carRef.id),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Car added successfully",
        data: { carId: carRef.id },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Error adding car");
  }
}
