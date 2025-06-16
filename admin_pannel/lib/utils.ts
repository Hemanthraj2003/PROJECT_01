import { NextRequest, NextResponse } from "next/server";

// Utility function to handle API errors consistently
export function handleApiError(
  error: any,
  message: string = "Internal server error"
) {
  console.error("API Error:", error);
  return NextResponse.json(
    {
      success: false,
      message,
      error: error.message || "Unknown error",
    },
    { status: 500 }
  );
}

// Utility function to validate required fields
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

// Utility function to get request body safely
export async function getRequestBody(request: NextRequest): Promise<any> {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }
}

// Utility function to get query parameters
export function getQueryParams(request: NextRequest) {
  const params: { [key: string]: string } = {};

  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Utility function to parse pagination parameters
export function parsePaginationParams(query: any) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const startAt = (page - 1) * limit;

  return { page, limit, startAt };
}

// Utility function to create pagination response
export function createPaginationResponse(
  data: any[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
      limit,
    },
  };
}

// Utility function to log API requests (similar to the original logger middleware)
export function logApiRequest(request: NextRequest, endpoint: string) {
  const currentDateTime = new Date().toISOString();
  console.log(
    `${request.method} request made to: ${endpoint} at ${currentDateTime}`
  );
}

// Utility function to generate OTP
export function generateOTP(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

// Utility function to send SMS (Fast2SMS integration)
export async function sendSMS(phoneNumber: string, otp: number): Promise<any> {
  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY || "",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        variables_values: otp.toString(),
        route: "otp",
        numbers: phoneNumber,
      }),
    });

    const data = await response.json();
    console.log("SMS API Response:", data);
    return data;
  } catch (error) {
    console.error("SMS sending error:", error);
    throw error;
  }
}

// Utility function to validate car status
export function isValidCarStatus(status: string): boolean {
  return ["pending", "approved", "rejected", "sold"].includes(status);
}

// Utility function to check if chat is already initiated
export async function isChatInitiated(db: any, carId: string, userId: string) {
  const snapshot = await db
    .collection("CHATS")
    .where("carId", "==", carId)
    .where("userId", "==", userId)
    .get();

  if (snapshot.empty) {
    return { isChat: false };
  }

  const chat = snapshot.docs[0].data();
  return { isChat: true, chat };
}
