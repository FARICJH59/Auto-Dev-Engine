# === Decrypt .env on startup ===
Set-StrictMode -Version Latest
Set-Location $PSScriptRoot

if (-Not (Test-Path ".env") -and (Test-Path ".env.gpg")) {
    gpg -d -o .env .env.gpg
    Write-Host "Decrypted .env"
}
Start-Sleep -Seconds 60  # Shorter timeout for security
