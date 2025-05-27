@echo off
echo ========================================
echo    Friends Cars - Development Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are installed. Proceeding with setup...
echo.

:: Install SERVER dependencies
echo ========================================
echo Installing SERVER dependencies...
echo ========================================
cd SERVER
if exist package.json (
    echo Installing server dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install server dependencies
        pause
        exit /b 1
    )
    echo Server dependencies installed successfully!
) else (
    echo ERROR: SERVER/package.json not found
    pause
    exit /b 1
)
cd ..
echo.

:: Install CarApp dependencies
echo ========================================
echo Installing CarApp dependencies...
echo ========================================
cd CarApp
if exist package.json (
    echo Installing CarApp dependencies with --legacy-peer-deps...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install CarApp dependencies
        pause
        exit /b 1
    )
    echo CarApp dependencies installed successfully!
) else (
    echo ERROR: CarApp/package.json not found
    pause
    exit /b 1
)
cd ..
echo.

:: Install Admin Panel dependencies
echo ========================================
echo Installing Admin Panel dependencies...
echo ========================================
cd admin_pannel
if exist package.json (
    echo Installing admin panel dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install admin panel dependencies
        pause
        exit /b 1
    )
    echo Admin panel dependencies installed successfully!
) else (
    echo ERROR: admin_pannel/package.json not found
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo    Setup completed successfully!
echo ========================================
echo.
echo To start the development environment, run:
echo   start-dev.bat (Windows)
echo   ./start-dev.sh (Linux/Mac)
echo.
pause
