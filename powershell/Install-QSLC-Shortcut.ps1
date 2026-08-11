$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $PSScriptRoot 'QSLC-Control.ps1'
$desktop = [Environment]::GetFolderPath('Desktop')
$linkPath = Join-Path $desktop 'QSLC Control.lnk'

$ws = New-Object -ComObject WScript.Shell
$shortcut = $ws.CreateShortcut($linkPath)
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`" -All"
$shortcut.WorkingDirectory = $repoRoot
$shortcut.Description = 'QSLC Control Center diagnostics and launcher'
$shortcut.Save()

Write-Host "Created desktop shortcut: $linkPath"
Write-Host 'Windows taskbar/Start pinning is intentionally not forced because modern Windows blocks reliable silent pinning. You can pin the created shortcut manually if desired.'
