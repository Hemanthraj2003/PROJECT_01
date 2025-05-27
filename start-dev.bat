@echo off
echo ========================================
echo    Friends Cars - Starting Development
echo ========================================
echo.

:: Check if dependencies are installed
if not exist "SERVER\node_modules" (
    echo ERROR: Server dependencies not found. Please run setup-dev.bat first.
    pause
    exit /b 1
)

if not exist "CarApp\node_modules" (
    echo ERROR: CarApp dependencies not found. Please run setup-dev.bat first.
    pause
    exit /b 1
)

if not exist "admin_pannel\node_modules" (
    echo ERROR: Admin panel dependencies not found. Please run setup-dev.bat first.
    pause
    exit /b 1
)

echo Starting all services...
echo.
echo Services will start in the following order:
echo 1. Backend Server (PORT: 5000)
echo 2. Admin Panel (PORT: 3000)
echo 3. CarApp (Expo Development Server)
echo.
echo Press Ctrl+C in any window to stop that service
echo Close all windows to stop all services
echo.

:: Start Backend Server
echo Starting Backend Server...
start "Backend Server" cmd /k "cd SERVER && npm start"

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Start Admin Panel
echo Starting Admin Panel...
start "Admin Panel" cmd /k "cd admin_pannel && npm run dev"

:: Wait a moment for admin panel to start
timeout /t 3 /nobreak >nul

:: Start CarApp
echo Starting CarApp...
start "CarApp - Expo" cmd /k "cd CarApp && npm start"

echo.
echo ========================================
echo    All services started successfully!
echo ========================================
echo.
echo Services running:
echo - Backend Server: http://localhost:5000
echo - Admin Panel: http://localhost:3000
echo - CarApp: Follow Expo CLI instructions
echo.
echo To stop all services, close all the opened terminal windows.
echo.
pause
