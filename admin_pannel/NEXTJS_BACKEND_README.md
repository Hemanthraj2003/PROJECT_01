# Next.js Backend API Documentation

This document describes the Next.js backend implementation that mirrors all functionality from the original Express.js server.

## 🚀 Overview

The Next.js backend provides identical functionality to the original Express.js server, serving as a drop-in replacement. All endpoints maintain the same request/response formats, business logic, and database operations.

## 📁 Project Structure

```
admin_pannel/
├── app/
│   └── api/                    # Next.js API routes
│       ├── route.ts           # GET / - Basic hello world
│       ├── users/             # User-related endpoints
│       │   ├── route.ts       # GET /api/users
│       │   ├── signup/        # POST /api/users/signup
│       │   ├── update/        # PUT /api/users/update
│       │   ├── isExists/      # GET /api/users/isExists
│       │   ├── generate-otp/  # POST /api/users/generate-otp
│       │   └── [id]/          # GET /api/users/[id]
│       ├── cars/              # Car-related endpoints
│       │   ├── route.ts       # GET/POST /api/cars
│       │   ├── post/          # POST /api/cars/post
│       │   ├── pending/       # GET /api/cars/pending
│       │   ├── getMyCars/     # POST /api/cars/getMyCars
│       │   └── [id]/          # GET /api/cars/[id]
│       │       └── status/    # PUT /api/cars/[id]/status
│       ├── chats/             # Chat-related endpoints
│       │   ├── start/         # POST /api/chats/start
│       │   ├── send/          # POST /api/chats/send
│       │   ├── admin/         # POST /api/chats/admin
│       │   ├── user/[userId]/ # POST /api/chats/user/[userId]
│       │   └── [chatId]/      # POST /api/chats/[chatId]
│       └── upload-images/     # POST /api/upload-images
├── lib/                       # Utility libraries
│   ├── firebase.ts           # Firebase configuration
│   ├── utils.ts              # Utility functions
│   └── upload.ts             # File upload handling
└── public/
    └── uploads/              # Uploaded files directory
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd admin_pannel
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=carshu-1e768
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_client_cert_url

# Fast2SMS API Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key

# Development Mode
NODE_ENV=development
```

### 3. Firebase Service Account

For development, the system will fallback to the original service account file:
- Ensure `SERVER/carshu-1e768-firebase-adminsdk-fbsvc-3503135aec.json` exists
- For production, use environment variables instead

### 4. Create Uploads Directory

```bash
mkdir -p public/uploads
```

## 🌐 API Endpoints

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://yourdomain.com/api`

### User Endpoints
- `GET /api/users` - Get all users
- `POST /api/users/signup` - Register new user
- `PUT /api/users/update` - Update user profile
- `GET /api/users/isExists?phone=1234567890` - Check if user exists
- `GET /api/users/[id]` - Get user by ID
- `POST /api/users/generate-otp` - Generate OTP for phone verification

### Car Endpoints
- `GET /api/cars?page=1&limit=10` - Get all cars (paginated)
- `POST /api/cars` - Get filtered cars
- `POST /api/cars/post` - Post car for approval
- `GET /api/cars/pending` - Get pending cars
- `POST /api/cars/getMyCars` - Get cars by IDs
- `GET /api/cars/[id]` - Get car by ID
- `PUT /api/cars/[id]/status` - Update car status

### Chat Endpoints
- `POST /api/chats/start` - Start new chat
- `POST /api/chats/send` - Send message to chat
- `POST /api/chats/admin` - Get all chats (admin)
- `POST /api/chats/user/[userId]` - Get user chats
- `POST /api/chats/[chatId]` - Get chat by ID

### Upload Endpoints
- `POST /api/upload-images` - Upload multiple images

## 🔄 Migration from Express.js

### URL Mapping
| Express.js | Next.js |
|------------|---------|
| `http://localhost:5000/` | `http://localhost:3000/api/` |
| `http://localhost:5000/users` | `http://localhost:3000/api/users` |
| `http://localhost:5000/cars` | `http://localhost:3000/api/cars` |
| `http://localhost:5000/chats` | `http://localhost:3000/api/chats` |
| `http://localhost:5000/api/upload-images` | `http://localhost:3000/api/upload-images` |

### Client Configuration
Update your client applications to use the new base URL:
```javascript
// Old
const API_BASE = "http://localhost:5000";

// New
const API_BASE = "http://localhost:3000/api";
```

## 🚀 Running the Backend

### Development Mode
```bash
npm run dev
```
The API will be available at `http://localhost:3000/api`

### Production Mode
```bash
npm run build
npm start
```

## 🔍 Testing the API

### Basic Health Check
```bash
curl http://localhost:3000/api
# Response: {"message":"Hello World!!!"}
```

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Upload Images
```bash
curl -X POST -F "images=@image1.jpg" -F "images=@image2.jpg" \
  http://localhost:3000/api/upload-images
```

## 📊 Features

### ✅ Implemented Features
- ✅ All user management endpoints
- ✅ Complete car management system
- ✅ Full chat functionality
- ✅ File upload handling
- ✅ Firebase Firestore integration
- ✅ OTP generation and SMS sending
- ✅ Pagination support
- ✅ Error handling and logging
- ✅ Request validation
- ✅ Transaction support for data consistency

### 🔧 Technical Features
- ✅ TypeScript support
- ✅ Next.js App Router
- ✅ Firebase Admin SDK
- ✅ Formidable for file uploads
- ✅ UUID for unique file naming
- ✅ Winston-style logging
- ✅ CORS handling (built into Next.js)
- ✅ Environment variable support

## 🛡️ Security

- Firebase Admin SDK for secure database access
- Input validation on all endpoints
- File type validation for uploads
- User verification for chat operations
- Transaction-based updates for data consistency

## 📝 Notes

1. **File Uploads**: Files are stored in `public/uploads/` directory
2. **Database**: Uses the same Firebase Firestore collections (USERS, CARS, CHATS)
3. **Compatibility**: 100% compatible with existing client applications
4. **Performance**: Next.js API routes provide excellent performance
5. **Scalability**: Can be easily deployed to Vercel, Netlify, or any Node.js hosting

## 🔄 Deployment

The Next.js backend can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **Any Node.js hosting provider**

Make sure to:
1. Set environment variables in your hosting platform
2. Configure the uploads directory for file storage
3. Update client applications with the new API base URL
