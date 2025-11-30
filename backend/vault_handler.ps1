# === Decrypt .env on startup ===
cd "C:\Users\User\auto-dev-engine\backend"
if (-Not (Test-Path ".env") -and (Test-Path ".env.gpg")) {
    gpg -d -o .env .env.gpg
    Write-Host " Decrypted .env"
}
Start-Sleep -Seconds 1200
if (Test-Path ".env") {
    Remove-Item ".env"
    Write-Host " Deleted .env after timeout"
}
