# PowerShell script to start the frontend Vite development server
$root = $PSScriptRoot
Write-Host "Starting Athletiq Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location (Join-Path $root "frontend")
npm run dev
