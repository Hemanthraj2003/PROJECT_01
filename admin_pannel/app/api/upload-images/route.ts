import { NextRequest, NextResponse } from "next/server";
import { logApiRequest } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configure route to handle file uploads
export const runtime = 'nodejs'; // Use Node.js runtime for file system access
export const dynamic = 'force-dynamic'; // Disable caching

// POST /api/upload-images - Upload multiple images
export async function POST(request: NextRequest) {
  logApiRequest(request, "/api/upload-images");

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files uploaded",
        },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Only image files are allowed",
          },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json(
          {
            success: false,
            message: "File size must be less than 10MB",
          },
          { status: 400 }
        );
      }
    }

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save files and generate URLs
    const imageUrls: string[] = [];
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    for (const file of files) {
      try {
        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Convert file to buffer and write
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Generate URL
        const imageUrl = `${baseUrl}/uploads/${filename}`;
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error("Error saving file:", error);
        throw new Error("Failed to save file");
      }
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
        message:
          error instanceof Error ? error.message : "Error uploading files",
      },
      { status: 500 }
    );
  }
}
