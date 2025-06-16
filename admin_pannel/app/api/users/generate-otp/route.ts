import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, logApiRequest, getRequestBody, generateOTP, sendSMS } from '@/lib/utils';

// POST /api/users/generate-otp - Generate OTP for phone verification
export async function POST(request: NextRequest) {
  logApiRequest(request, '/api/users/generate-otp');
  
  try {
    const { phoneNumber } = await getRequestBody(request);
    const otp = generateOTP();
    console.log("Generated OTP: ", otp);

    if (!phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required",
        },
        { status: 400 }
      );
    }

    if (phoneNumber && otp) {
      try {
        await sendSMS(phoneNumber, otp);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Continue even if SMS fails - return OTP for testing
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { OTP: otp },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Error generating OTP");
  }
}
