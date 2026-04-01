# run.ps1 - Start both SnapCap Backend and Frontend

Write-Host "--- Starting SnapCap Application ---" -ForegroundColor Cyan

# 1. Start Backend (Terminal 1)
Write-Host ">> Launching Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\.venv\Scripts\activate; python server.py"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 2

# 2. Start Frontend (Terminal 2)
Write-Host ">> Launching Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd snapcap-pwa; npm run dev"

Write-Host "`nReady! Backend at http://localhost:8000 | Frontend at http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press any key to exit this script (terminals will remain open)."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
