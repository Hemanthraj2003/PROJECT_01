# Friends Cars - Car Resale Application

A comprehensive car resale platform built with React Native (Expo), Next.js admin panel, and Node.js backend.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Expo CLI** (optional, for advanced features)
- **Git** - [Download here](https://git-scm.com/)

### 🛠️ Development Setup

#### Option 1: NPM Scripts (Recommended)

```bash
# 1. Install root dependencies (includes concurrently for running multiple services)
npm install

# 2. Install dependencies for all projects
npm run setup

# 3. Start all development servers simultaneously
npm run dev
```

#### Option 2: Platform-Specific Scripts

**For Windows:**
```bash
# 1. Install dependencies for all projects
setup-dev.bat

# 2. Start all development servers
start-dev.bat
```

**For Linux/Mac:**
```bash
# 1. Make scripts executable (first time only)
chmod +x setup-dev.sh start-dev.sh

# 2. Install dependencies for all projects
./setup-dev.sh

# 3. Start all development servers
./start-dev.sh
```

#### Option 2: Manual Setup

1. **Install Server Dependencies:**
   ```bash
   cd SERVER
   npm install
   cd ..
   ```

2. **Install CarApp Dependencies:**
   ```bash
   cd CarApp
   npm install --legacy-peer-deps
   cd ..
   ```

3. **Install Admin Panel Dependencies:**
   ```bash
   cd admin_pannel
   npm install
   cd ..
   ```

4. **Start Development Servers:**

   **Terminal 1 - Backend Server:**
   ```bash
   cd SERVER
   npm start
   ```

   **Terminal 2 - Admin Panel:**
   ```bash
   cd admin_pannel
   npm run dev
   ```

   **Terminal 3 - CarApp:**
   ```bash
   cd CarApp
   npm start
   ```

## 📱 Project Structure

```
Friends-Cars/
├── CarApp/                 # React Native mobile app (Expo)
├── admin_pannel/          # Next.js admin dashboard
├── SERVER/                # Node.js backend API
├── setup-dev.bat         # Windows setup script
├── setup-dev.sh          # Linux/Mac setup script
├── start-dev.bat         # Windows development start script
├── start-dev.sh          # Linux/Mac development start script
└── README.md             # This file
```

## 🌐 Development URLs

After running the development setup:

- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000
- **CarApp:** Follow Expo CLI instructions (usually http://localhost:19006 for web)

## 📋 Environment Configuration

### CarApp Environment Setup

1. Copy the environment template:
   ```bash
   cd CarApp
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_APP_NAME=Friends Cars
   ```

### Server Environment Setup

1. Create a `.env` file in the SERVER directory:
   ```bash
   cd SERVER
   touch .env  # Linux/Mac
   # or create manually on Windows
   ```

2. Add your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   # Add your Firebase and other configurations here
   ```

## 🔧 Development Features

### CarApp (Mobile App)
- **Filter System:** Advanced car filtering with price ranges, fuel types, KM driven, and transmission
- **Offline Support:** Works offline with cached data
- **Real-time Updates:** Live chat and notifications
- **Image Upload:** Multiple image support for car listings

### Admin Panel
- **Car Management:** Approve/reject car listings
- **User Management:** View and manage user accounts
- **Analytics:** Dashboard with insights and statistics
- **Chat Moderation:** Monitor and manage user chats

### Backend API
- **RESTful API:** Clean and documented endpoints
- **Firebase Integration:** Real-time database and authentication
- **Image Processing:** Automatic image optimization
- **Security:** CORS protection and input validation

## 📜 Available NPM Scripts

From the root directory, you can use these convenient scripts:

```bash
# Setup and Installation
npm run setup              # Install dependencies for all projects
npm run setup:server       # Install only server dependencies
npm run setup:carapp       # Install only CarApp dependencies (with --legacy-peer-deps)
npm run setup:admin        # Install only admin panel dependencies

# Development
npm run dev                # Start all development servers simultaneously
npm run dev:server         # Start only the backend server
npm run dev:admin          # Start only the admin panel
npm run dev:carapp         # Start only the CarApp

# Maintenance
npm run check              # Check if setup is correct and all dependencies are installed
npm run clean              # Remove all node_modules and package-lock.json files
npm run reinstall          # Clean and reinstall all dependencies

# Building
npm run build              # Build admin panel for production
npm run build:admin        # Build admin panel
npm run build:carapp       # Build CarApp for Android

# Testing
npm run test               # Run CarApp tests
npm run test:carapp        # Run CarApp tests specifically
```

## 🧪 Testing

### Running Tests

```bash
# Using root scripts (recommended)
npm run test

# Or manually for each project
cd CarApp && npm test
cd SERVER && npm test      # If tests are available
cd admin_pannel && npm test
```

## 🚀 Production Deployment

### Security Checklist

Before deploying to production, ensure:

- [ ] All API endpoints use HTTPS
- [ ] Environment variables are properly configured
- [ ] CORS is restricted to your domains
- [ ] Firebase security rules are configured
- [ ] Input validation is implemented
- [ ] Error logging is set up

### Build Commands

**CarApp (Mobile):**
```bash
cd CarApp
expo build:android  # For Android
expo build:ios      # For iOS
```

**Admin Panel:**
```bash
cd admin_pannel
npm run build
```

**Server:**
```bash
cd SERVER
# Deploy to your preferred hosting service
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Cannot find module" errors:**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps  # For CarApp only
   ```

2. **Port already in use:**
   ```bash
   # Kill processes using the ports
   npx kill-port 3000 5000 19000 19001 19002
   ```

3. **Expo CLI issues:**
   ```bash
   # Install/update Expo CLI globally
   npm install -g @expo/cli
   ```

4. **Metro bundler issues:**
   ```bash
   cd CarApp
   npx expo start --clear
   ```

### Getting Help

- Check the console logs in each terminal window
- Ensure all dependencies are installed correctly
- Verify your Node.js version is compatible
- Check that all required ports are available

## 📝 Development Notes

- **CarApp** requires `--legacy-peer-deps` flag due to React Native dependencies
- **Server** runs on port 5000 by default
- **Admin Panel** runs on port 3000 by default
- All services must be running for full functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
