param(
  [switch]$OpenDashboard,
  [switch]$Diagnostics,
  [switch]$All
)

$ErrorActionPreference = 'Stop'

function Show-Header($Text) {
  Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Invoke-QSLCDiagnostics {
  Show-Header 'System'
  Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, FreePhysicalMemory, TotalVisibleMemorySize

  Show-Header 'Memory'
  Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory

  Show-Header 'Wi-Fi adapters'
  Get-NetAdapter | Where-Object {$_.InterfaceDescription -match 'Wi-Fi|Wireless'} | Select-Object Name, Status, LinkSpeed, MacAddress

  Show-Header 'IP / DNS'
  Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway, DNSServer

  Show-Header 'Internet reachability'
  Test-NetConnection 1.1.1.1 -Port 443 | Select-Object ComputerName, RemotePort, TcpTestSucceeded

  Show-Header 'GitHub CLI'
  if (Get-Command gh -ErrorAction SilentlyContinue) { gh auth status } else { Write-Warning 'gh CLI not installed' }

  Show-Header 'Cloudflare Wrangler'
  if (Get-Command wrangler -ErrorAction SilentlyContinue) { wrangler --version } else { Write-Warning 'wrangler not installed' }
}

function Open-QSLCDashboard {
  $urls = @(
    'https://github.com/Sovereign-maxeffort/SovereignHQ-Control',
    'https://github.com/Sovereign-maxeffort/QSLC_SOVEREIGN_DASHBOARD'
  )
  foreach ($url in $urls) { Start-Process $url }
}

if ($All -or $Diagnostics) { Invoke-QSLCDiagnostics }
if ($All -or $OpenDashboard) { Open-QSLCDashboard }
if (-not ($All -or $Diagnostics -or $OpenDashboard)) {
  Write-Host 'Use: .\QSLC-Control.ps1 -Diagnostics | -OpenDashboard | -All'
}
