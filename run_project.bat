@echo off
echo LuxeStream Project Setup and Run Script
echo ======================================

:: Check for Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check for Python
echo Checking Python installation...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed. Please install Python from https://www.python.org/
    pause
    exit /b 1
)

:: Check for MongoDB
echo Checking MongoDB installation...
where mongod >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

:: Start MongoDB service
echo Starting MongoDB service...
net start MongoDB >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo MongoDB service is not running. Please start it manually.
    pause
    exit /b 1
)

:: Install backend dependencies
echo Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Failed to install Python dependencies
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd ../client
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

:: Start backend server
echo Starting backend server...
start cmd /k "cd ../server && npm run dev"

:: Start frontend development server
echo Starting frontend development server...
start cmd /k "cd client && npm start"

echo.
echo Project setup complete!
echo Backend server is running on http://localhost:5000
echo Frontend is running on http://localhost:3000
echo.
echo Press any key to exit...
pause >nul 