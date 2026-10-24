# PowerShell script to start the backend with environment variables
$root = $PSScriptRoot

# Load .env if it exists
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $varName = $parts[0].Trim()
            $varVal = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($varName, $varVal, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

if (-not $env:DB_USERNAME) { $env:DB_USERNAME = "root" }

if (-not $env:DB_PASSWORD -or $env:DB_PASSWORD -eq "your_mysql_password_here") {
    $pw = Read-Host "Enter MySQL password for user '$($env:DB_USERNAME)'"
    $env:DB_PASSWORD = $pw
}

if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = "4b8f9e2a1d7c6b5a3e0f9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d"
}

if (-not $env:SPRING_PROFILES_ACTIVE) {
    $env:SPRING_PROFILES_ACTIVE = "dev"
}

if (-not $env:DEMO_ADMIN_PASSWORD) {
    $env:DEMO_ADMIN_PASSWORD = "Admin@12345"
}

if (-not $env:DEMO_CUSTOMER_PASSWORD) {
    $env:DEMO_CUSTOMER_PASSWORD = "Customer@12345"
}

Write-Host "Starting Athletiq Backend on http://localhost:8080..." -ForegroundColor Green
Set-Location (Join-Path $root "backend")
mvn spring-boot:run
