@echo off
set ROOT=%~dp0

echo Starting backend...
start "Backend" cmd /k "cd /d %ROOT%chancellery-router-backend && npm start"

echo Starting frontend...
start "Frontend" cmd /k "cd /d %ROOT%chancellery-router-frontend && npm start"

echo Both servers started. Close the terminal windows to stop them.
