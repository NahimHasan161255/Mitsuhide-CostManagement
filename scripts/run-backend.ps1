param([int]$Port = 5048)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend\Mitsuhide.Api"
$logsDir = Join-Path $rootDir "logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }
$logFile = Join-Path $logsDir "backend.log"

Set-Location $backendDir
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Auto-restart daemon loop: keeps Backend API alive permanently in the background
while ($true) {
    cmd.exe /c "dotnet run --no-build --urls http://0.0.0.0:$Port <nul > `"$logFile`" 2>&1"
    Start-Sleep -Seconds 2
}
