# Start production services
# ----------------------------------------

# Start backend
Start-Process powershell -ArgumentList 'Set-Location backend; uvicorn main:app --host 0.0.0.0 --port 8000' -NoNewWindow

# Start frontend production server
Start-Process powershell -ArgumentList 'Set-Location frontend; npm run dev' -NoNewWindow
