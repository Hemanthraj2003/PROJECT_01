import formidable from 'formidable';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure formidable options
export const formidableOptions: formidable.Options = {
  uploadDir,
  keepExtensions: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB max file size
  maxFiles: 10,
  filename: (name, ext, part) => {
    // Generate unique filename using UUID
    const uniqueFilename = `${uuidv4()}${ext}`;
    return uniqueFilename;
  },
  filter: (part) => {
    // Filter for image files only
    const mimeType = part.mimetype || '';
    return mimeType.startsWith('image/');
  },
};

// Parse form data with file uploads
export function parseFormData(req: any): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable(formidableOptions);
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

// Validate uploaded files
export function validateImageFiles(files: formidable.Files): string | null {
  const imageFiles = files.images;
  
  if (!imageFiles) {
    return 'No files uploaded';
  }
  
  const fileArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
  
  for (const file of fileArray) {
    // Check file type
    if (!file.mimetype?.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return 'Only image files are allowed!';
    }
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }
  }
  
  return null;
}

// Generate image URLs from uploaded files
export function generateImageUrls(files: formidable.Files, baseUrl: string): string[] {
  const imageFiles = files.images;
  
  if (!imageFiles) {
    return [];
  }
  
  const fileArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
  
  return fileArray.map(file => {
    const filename = path.basename(file.filepath);
    return `${baseUrl}/uploads/${filename}`;
  });
}

// Clean up uploaded files in case of error
export function cleanupFiles(files: formidable.Files): void {
  const imageFiles = files.images;
  
  if (!imageFiles) {
    return;
  }
  
  const fileArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
  
  fileArray.forEach(file => {
    try {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  });
}
