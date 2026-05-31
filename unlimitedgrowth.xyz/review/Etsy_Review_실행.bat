@echo off
title Etsy Reviews Local Server
cd /d "%~dp0"

echo ==================================================
echo           Etsy Reviews Local Server
echo ==================================================
echo.
echo Starting local web server...
echo The browser will open at http://localhost:8000 in a moment.
echo.
echo * Keep this window open while viewing the reviews.
echo * Close this window to stop the server when done.
echo ==================================================
echo.

:: Start browser after a 1 second delay
start /b cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:8000"

:: Run python server
python -m http.server 8000

if errorlevel 1 (
    echo.
    echo Trying alternative python command...
    py -m http.server 8000
)

if errorlevel 1 (
    echo.
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python to run this server.
    echo.
    pause
)
