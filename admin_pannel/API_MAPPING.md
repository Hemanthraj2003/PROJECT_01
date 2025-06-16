# API Endpoint Mapping: Express.js → Next.js

This document provides a complete mapping between the original Express.js server endpoints and the new Next.js API routes.

## 🔄 Base URL Changes

| Environment | Express.js Server | Next.js Backend |
|-------------|-------------------|-----------------|
| Development | `http://localhost:5000` | `http://localhost:3000/api` |
| Production | `http://your-server:5000` | `http://your-domain.com/api` |

## 📋 Complete Endpoint Mapping

### Basic Routes
| Method | Express.js | Next.js | File Location |
|--------|------------|---------|---------------|
| GET | `/` | `/api/` | `app/api/route.ts` |

### User Routes (`/users` → `/api/users`)
| Method | Express.js | Next.js | File Location |
|--------|------------|---------|---------------|
| GET | `/users` | `/api/users` | `app/api/users/route.ts` |
| POST | `/users/signup` | `/api/users/signup` | `app/api/users/signup/route.ts` |
| PUT | `/users/update` | `/api/users/update` | `app/api/users/update/route.ts` |
| GET | `/users/isExists` | `/api/users/isExists` | `app/api/users/isExists/route.ts` |
| GET | `/users/:id` | `/api/users/[id]` | `app/api/users/[id]/route.ts` |
| POST | N/A (was in dboperations) | `/api/users/generate-otp` | `app/api/users/generate-otp/route.ts` |

### Car Routes (`/cars` → `/api/cars`)
| Method | Express.js | Next.js | File Location |
|--------|------------|---------|---------------|
| GET | `/cars` | `/api/cars` | `app/api/cars/route.ts` |
| POST | `/cars` | `/api/cars` | `app/api/cars/route.ts` |
| POST | `/cars/post` | `/api/cars/post` | `app/api/cars/post/route.ts` |
| GET | `/cars/pending` | `/api/cars/pending` | `app/api/cars/pending/route.ts` |
| POST | `/cars/getMyCars` | `/api/cars/getMyCars` | `app/api/cars/getMyCars/route.ts` |
| GET | `/cars/:id` | `/api/cars/[id]` | `app/api/cars/[id]/route.ts` |
| PUT | `/cars/:id/status` | `/api/cars/[id]/status` | `app/api/cars/[id]/status/route.ts` |

### Upload Routes (`/api` → `/api`)
| Method | Express.js | Next.js | File Location |
|--------|------------|---------|---------------|
| POST | `/api/upload-images` | `/api/upload-images` | `app/api/upload-images/route.ts` |

### Chat Routes (`/chats` → `/api/chats`)
| Method | Express.js | Next.js | File Location |
|--------|------------|---------|---------------|
| POST | `/chats/start` | `/api/chats/start` | `app/api/chats/start/route.ts` |
| POST | `/chats/send` | `/api/chats/send` | `app/api/chats/send/route.ts` |
| POST | `/chats/admin` | `/api/chats/admin` | `app/api/chats/admin/route.ts` |
| POST | `/chats/user/:userId` | `/api/chats/user/[userId]` | `app/api/chats/user/[userId]/route.ts` |
| POST | `/chats/:chatId` (implied) | `/api/chats/[chatId]` | `app/api/chats/[chatId]/route.ts` |

## 🔧 Function Mapping

### Database Operations (`SERVER/services/dboperations.js` → Next.js API Routes)

| Original Function | Express Route | Next.js Route | Implementation |
|-------------------|---------------|---------------|----------------|
| `getAllUsers` | `GET /users` | `GET /api/users` | ✅ Complete |
| `registerUsers` | `POST /users/signup` | `POST /api/users/signup` | ✅ Complete |
| `updateProfile` | `PUT /users/update` | `PUT /api/users/update` | ✅ Complete |
| `checkUserExists` | `GET /users/isExists` | `GET /api/users/isExists` | ✅ Complete |
| `getUserById` | `GET /users/:id` | `GET /api/users/[id]` | ✅ Complete |
| `generateOtp` | N/A | `POST /api/users/generate-otp` | ✅ Complete |
| `getAllCars` | `GET /cars` | `GET /api/cars` | ✅ Complete |
| `getAllPendingCars` | `GET /cars/pending` | `GET /api/cars/pending` | ✅ Complete |
| `getFilteredCars` | `POST /cars` | `POST /api/cars` | ✅ Complete |
| `getCarsByIds` | `POST /cars/getMyCars` | `POST /api/cars/getMyCars` | ✅ Complete |
| `postCarForApproval` | `POST /cars/post` | `POST /api/cars/post` | ✅ Complete |
| `getCarById` | `GET /cars/:id` | `GET /api/cars/[id]` | ✅ Complete |
| `updateCarStatus` | `PUT /cars/:id/status` | `PUT /api/cars/[id]/status` | ✅ Complete |
| `startChat` | `POST /chats/start` | `POST /api/chats/start` | ✅ Complete |
| `getChatByChatId` | Implied | `POST /api/chats/[chatId]` | ✅ Complete |
| `sendMessageToChatId` | `POST /chats/send` | `POST /api/chats/send` | ✅ Complete |
| `getChats` | `POST /chats/admin` | `POST /api/chats/admin` | ✅ Complete |
| `getUserChats` | `POST /chats/user/:userId` | `POST /api/chats/user/[userId]` | ✅ Complete |

## 🛠️ Middleware & Configuration Mapping

| Express.js Component | Next.js Equivalent | Implementation |
|---------------------|-------------------|----------------|
| `cors()` | Built-in CORS | ✅ Automatic |
| `express.json()` | `request.json()` | ✅ Built-in |
| `express.static()` | `public/` directory | ✅ Automatic |
| Custom logger middleware | `logApiRequest()` utility | ✅ Complete |
| Error logger middleware | `handleApiError()` utility | ✅ Complete |
| Multer upload middleware | Formidable + custom config | ✅ Complete |

## 📁 File Structure Comparison

### Express.js Structure
```
SERVER/
├── server.js                 # Main server file
├── routes/
│   ├── index.js              # Basic routes
│   ├── userRoutes.js         # User routes
│   ├── carRoutes.js          # Car routes
│   ├── chatRoutes.js         # Chat routes
│   └── uploadRoutes.js       # Upload routes
├── services/
│   └── dboperations.js       # Database operations
├── middleware/
│   ├── logger.js             # Logging middleware
│   └── uploadConfig.js       # Upload configuration
└── config/
    └── firebase.js           # Firebase configuration
```

### Next.js Structure
```
admin_pannel/
├── app/api/                  # API routes directory
│   ├── route.ts              # Basic route
│   ├── users/                # User routes
│   ├── cars/                 # Car routes
│   ├── chats/                # Chat routes
│   └── upload-images/        # Upload route
├── lib/
│   ├── firebase.ts           # Firebase configuration
│   ├── utils.ts              # Utility functions
│   └── upload.ts             # Upload configuration
└── public/uploads/           # Static file serving
```

## 🔄 Client Migration Guide

### 1. Update Base URLs
```javascript
// Before (Express.js)
const API_BASE = "http://localhost:5000";

// After (Next.js)
const API_BASE = "http://localhost:3000/api";
```

### 2. Update Specific Endpoints
```javascript
// Before
fetch(`${API_BASE}/users`)
fetch(`${API_BASE}/cars/pending`)
fetch(`${API_BASE}/api/upload-images`)

// After
fetch(`${API_BASE}/users`)          // Same path
fetch(`${API_BASE}/cars/pending`)   // Same path
fetch(`${API_BASE}/upload-images`)  // Removed /api prefix
```

### 3. No Changes Required For:
- Request methods (GET, POST, PUT, etc.)
- Request body formats
- Response formats
- Authentication logic
- Error handling
- Pagination parameters

## ✅ Verification Checklist

- [ ] All 20+ endpoints implemented
- [ ] Database operations identical
- [ ] File upload functionality preserved
- [ ] Error handling consistent
- [ ] Logging functionality maintained
- [ ] Firebase integration working
- [ ] SMS/OTP functionality preserved
- [ ] Pagination working correctly
- [ ] Transaction support implemented
- [ ] Security measures in place

## 🚀 Deployment Considerations

1. **Environment Variables**: Migrate all `.env` variables
2. **File Storage**: Ensure `public/uploads` directory exists
3. **Database**: Same Firebase project and collections
4. **Dependencies**: All required packages installed
5. **CORS**: Handled automatically by Next.js
6. **Static Files**: Served from `public/` directory
7. **Logging**: Console logs work in development, configure for production

## 📊 Performance Benefits

- **Cold Start**: Faster than traditional Express.js
- **Serverless**: Can be deployed as serverless functions
- **Edge Runtime**: Potential for edge deployment
- **TypeScript**: Better type safety and development experience
- **Built-in Optimizations**: Next.js provides automatic optimizations
