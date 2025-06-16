import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase';
import { handleApiError, logApiRequest, getRequestBody, isValidCarStatus } from '@/lib/utils';

// PUT /api/cars/[id]/status - Update car status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logApiRequest(request, `/api/cars/${params.id}/status`);
  
  try {
    const { id } = params;
    const { status } = await getRequestBody(request);

    // Validate status
    if (!isValidCarStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status value. Must be 'pending', 'approved', 'rejected', or 'sold'",
        },
        { status: 400 }
      );
    }

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

    // Update the car status
    await db.collection("CARS").doc(id).update({
      carStatus: status,
    });

    // If status is changing to approved, rejected, or sold, update user's car arrays
    const carData = carDoc.data();
    const postedBy = carData?.postedBy;
    const userRef = db.collection("USERS").doc(postedBy);

    if (status === "approved" || status === "rejected" || status === "sold") {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error("User not found");
        }

        const userData = userDoc.data();

        // Get the current car status before the update
        const currentStatus = carData?.carStatus;

        // Update relevant arrays based on status
        if (status === "sold") {
          // When marking as sold, remove from onSaleCars and add to soldCars
          const updatedOnSaleCars = userData?.onSaleCars?.filter(
            (carId: string) => carId !== id
          ) || [];

          transaction.update(userRef, {
            onSaleCars: updatedOnSaleCars,
            soldCars: admin.firestore.FieldValue.arrayUnion(id),
          });

          console.log(
            `Car ${id} marked as sold: Removed from onSaleCars, added to soldCars for user ${postedBy}`
          );
        } else if (status === "approved" && currentStatus === "pending") {
          // Only add to onSaleCars if it's not already there
          // This prevents duplicate entries
          if (!userData?.onSaleCars?.includes(id)) {
            transaction.update(userRef, {
              onSaleCars: admin.firestore.FieldValue.arrayUnion(id),
            });
            console.log(
              `Car ${id} approved: Added to onSaleCars for user ${postedBy}`
            );
          }
        } else if (status === "rejected") {
          // For rejected cars, remove from onSaleCars
          const updatedOnSaleCars = userData?.onSaleCars?.filter(
            (carId: string) => carId !== id
          ) || [];

          transaction.update(userRef, {
            onSaleCars: updatedOnSaleCars,
          });

          console.log(
            `Car ${id} rejected: Removed from onSaleCars for user ${postedBy}`
          );
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Car status updated to ${status}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating car status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
