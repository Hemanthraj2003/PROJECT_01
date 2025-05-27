# 🚀 Quick Installation Guide

## Prerequisites

1. **Install Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Install Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## 🎯 One-Command Setup

### Method 1: NPM Scripts (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd friends-cars

# Install root dependencies and setup all projects
npm install && npm run setup

# Start all development servers
npm run dev
```

### Method 2: Platform Scripts

**Windows:**
```bash
git clone <your-repo-url>
cd friends-cars
setup-dev.bat
start-dev.bat
```

**Linux/Mac:**
```bash
git clone <your-repo-url>
cd friends-cars
chmod +x setup-dev.sh start-dev.sh
./setup-dev.sh
./start-dev.sh
```

## 🌐 Access Your Applications

After setup completes, access:

- **Mobile App (CarApp):** Follow Expo CLI instructions in terminal
- **Admin Panel:** http://localhost:3000
- **Backend API:** http://localhost:5000

## ⚡ Quick Commands

```bash
# Stop all services
Ctrl+C (in the terminal running npm run dev)

# Restart everything
npm run dev

# Clean install (if issues occur)
npm run clean && npm run setup && npm run dev
```

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Ensure all prerequisites are installed
- Verify ports 3000, 5000, and 19000-19002 are available
- Try the clean install command if you encounter issues
