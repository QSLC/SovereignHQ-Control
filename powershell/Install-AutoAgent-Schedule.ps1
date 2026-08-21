# Installs the SOVEREIGN_AUTO_AGENT scheduled task
# Run from elevated PowerShell
# Recommended: daily at 8 PM (not hourly — too many tabs)

$ScriptPath = "C:\Users\Qslc1\SovereignHQ\00_CONTROL\SOVEREIGN_AUTO_AGENT.ps1"

if (-not (Test-Path $ScriptPath)) {
    Write-Host "ERROR: $ScriptPath not found. Copy SOVEREIGN_AUTO_AGENT.ps1 there first." -ForegroundColor Red
    exit 1
}

schtasks /create /tn "SOVEREIGN_AUTO_AGENT" /tr "powershell.exe -File $ScriptPath" /sc daily /st 20:00

if ($?) {
    Write-Host "Scheduled task created. Runs daily at 8:00 PM." -ForegroundColor Green
} else {
    Write-Host "Failed to create scheduled task." -ForegroundColor Red
}
