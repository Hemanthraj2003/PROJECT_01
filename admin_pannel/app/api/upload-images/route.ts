import { NextRequest, NextResponse } from "next/server";
import { logApiRequest } from "@/lib/utils";
import {
  parseFormData,
  validateImageFiles,
  generateImageUrls,
  cleanupFiles,
} from "@/lib/upload";

// POST /api/upload-images - Upload multiple images
export async function POST(request: NextRequest) {
  logApiRequest(request, "/api/upload-images");

  try {
    // Parse form data with files
    const { fields, files } = await parseFormData(request);

    // Validate uploaded files
    const validationError = validateImageFiles(files);
    if (validationError) {
      cleanupFiles(files);
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }

    // Generate image URLs
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const imageUrls = generateImageUrls(files, baseUrl);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files uploaded",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        imageUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading files",
      },
      { status: 500 }
    );
  }
}
