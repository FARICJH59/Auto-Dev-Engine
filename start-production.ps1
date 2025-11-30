# Start backend (uses uvicorn)
Start-Process powershell -ArgumentList "Set-Location -Path "\backend"; uvicorn main:app --host 0.0.0.0 --port 8000" -NoNewWindow

# Start frontend production/dev server
# Use npm start for CRA dev server
Start-Process powershell -ArgumentList "Set-Location -Path "\frontend"; npm start" -NoNewWindow
