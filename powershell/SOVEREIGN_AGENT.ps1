# QSLC SOVEREIGN AGENT - TAB-AWARE STACK

Write-Host ">>> Sovereign Agent Starting..." -ForegroundColor Cyan

$Root    = "C:\Users\Qslc1\SovereignHQ"
$Logs    = "$Root\05_LOGS"
$Control = "$Root\00_CONTROL"

# Ensure log directory exists
if (-not (Test-Path $Logs)) { New-Item -ItemType Directory -Path $Logs -Force | Out-Null }

# 1. Biometric gate (manual Windows Hello)
Write-Host "Authenticate with fingerprint, then press Enter..."
Start-Process "ms-settings:signinoptions"
Pause

# 2. Base44 - condo superagent
Write-Host "Opening Base44 Superagent..."
Start-Process "https://app.base44.com/superagent/6a26b5efb34e302378c5fee9"

# 3. Base44 builder
Start-Process "https://base44.com/lp-en/builder"

# 4. Google AI Studio + Cloud billing
Start-Process "https://aistudio.google.com/prompts/new_chat?project=gen-lang-client-0959545493"
Start-Process "https://console.cloud.google.com/billing/01F6F1-7151B8-929DBE/reports?project=nimble-anagram-464716-e3&cloudshell=true"

# 5. QSLC SharePoint + SSOT workbook
Start-Process "https://quantumsovereignlogisticsco.sharepoint.com/_layouts/15/sharepoint.aspx/discover"
Start-Process "https://quantumsovereignlogisticsco.sharepoint.com/:x:/r/sites/allcompany/_layouts/15/Doc.aspx?sourcedoc=%7B2999DC96-F847-4A1A-B2AC-2F5BC8998853%7D&file=QSLC_Executive_Operating_Workbook_UPDATED_2026-08-06.xlsx&action=default&mobileredirect=true"
Start-Process "https://quantumsovereignlogisticsco-my.sharepoint.com/personal/sovereign_quantumsovereignlogisticsco_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7B679E7BDB-B200-4871-AD3A-59A0EA4383B6%7D&file=QSLC_SSOT_FINISHED_PACK.ods&action=default&mobileredirect=true&DefaultItemOpen=1"

# 6. Copilot + Paychex + ChatGPT
Start-Process "https://m365.cloud.microsoft/cowork?auth=2&home=1&from=ShellLogo&username=Sovereign%40QuantumSovereignLogisticsCo.onmicrosoft.com&login_hint=Sovereign%40QuantumSovereignLogisticsCo.onmicrosoft.com"
Start-Process "https://login.flex.paychex.com/login_static/UsernameOnly.html?lang=en&landingRedirect=true&downtime=false"
Start-Process "https://chatgpt.com"

# 7. EVE Command Center + local stack
Start-Process "http://localhost"
Start-Process "http://127.0.0.1:5174"
Start-Process "http://127.0.0.1:5191/health"
Start-Process "http://127.0.0.1:5180/health"

# 8. Log run
$LogFile = "$Logs\sovereign_agent_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
"Agent run at $(Get-Date)" | Out-File $LogFile

Write-Host ">>> Sovereign Agent Finished." -ForegroundColor Green
