@echo off
echo ===================================================
echo Starting Poojitha Reddy Electricals MERN App...
echo ===================================================

:: Start Backend server in a new window
echo Launching Backend Server on Port 5000...
start cmd /k "title PRE Backend Server && cd backend && npm start"

:: Start Frontend server in a new window
echo Launching Frontend Client Dev Server...
start cmd /k "title PRE Frontend Client && cd frontend && npm run dev"

:: Wait for servers to spin up
echo Waiting for servers to initialize...
timeout /t 3 /nobreak > nul

:: Open browser
echo Opening website in browser...
start http://localhost:5173

echo ===================================================
echo All processes launched! Feel free to close this window.
echo ===================================================
pause
