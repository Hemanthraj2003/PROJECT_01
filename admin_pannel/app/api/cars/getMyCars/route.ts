import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody } from '@/lib/utils';

// POST /api/cars/getMyCars - Get cars by IDs
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/cars/getMyCars');
  
  try {
    const { carsIds } = await getRequestBody(request);

    if (!Array.isArray(carsIds) || carsIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty carIds array" },
        { status: 400 }
      );
    }

    // Constructing docRefs which is used to get the doc note: this will not call any data
    const carRefs = carsIds.map((id) => db.collection("CARS").doc(id));

    // Return all raw data
    const carsSnapshots = await db.getAll(...carRefs);

    // Filtering raw data
    const cars = carsSnapshots
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    if (cars.length === 0) {
      return NextResponse.json(
        { success: false, message: "No cars found for the given IDs" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: cars },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
