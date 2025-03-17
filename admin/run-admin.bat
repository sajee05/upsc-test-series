@echo off
cd /d "%~dp0"

:: Start the local backend server
start "" python server.py

:: Wait for 3 seconds
timeout /t 3 >nul

:: Open Admin Panel in default browser
start "" "C:\Users\FO\Documents\GitHub\upsc-test-series\admin\index.html"

echo Local site updated. Push to GitHub manually if needed.
pause
