@echo off
setlocal

set "ROOT=%~dp0"

echo Starting backend on http://127.0.0.1:8000
start "LegalEase Backend" cmd /k "cd /d "%ROOT%backend" && start_backend.cmd"

echo Starting frontend on http://127.0.0.1:5173
start "LegalEase Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo LegalEase is launching in two windows.
