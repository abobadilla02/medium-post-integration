@echo off
echo Starting Medium Scheduler...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Then restart this script
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting the application...
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:4000
echo GraphQL Playground: http://localhost:4000/graphql
echo.
echo Press Ctrl+C to stop the application
echo.

call npm run dev 