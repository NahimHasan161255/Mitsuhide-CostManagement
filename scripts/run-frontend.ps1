param(
    [int]$Port = 3001,
    [int]$ApiPort = 5048
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$rootDir = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $rootDir "frontend"
$logsDir = Join-Path $rootDir "logs"
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }
$logFile = Join-Path $logsDir "frontend.log"

Set-Location $frontendDir
$env:VITE_PORT = "$Port"
$env:VITE_API_PORT = "$ApiPort"
$env:CI = "true"

# Auto-restart daemon loop: keeps Vite alive permanently in the background
while ($true) {
    cmd.exe /c "npx vite --host 0.0.0.0 --port $Port <nul > `"$logFile`" 2>&1"
    Start-Sleep -Seconds 2
}
