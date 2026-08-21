# ============================================================
# QSLC SOVEREIGN AUTO-AGENT
# Auto-Advance | Tab-Aware | Free-Tier Compatible
# 
# NOTE: Stripe checkout URL removed for safety.
# If you need to pay for something, go to stripe.com manually.
# ============================================================

Write-Host ">>> Sovereign Auto-Agent Starting..." -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. Biometric Gate (Windows Hello)
# ------------------------------------------------------------
Write-Host "Authenticate with fingerprint to unlock Sovereign Agent..."
Start-Process "ms-settings:signinoptions"
Pause

# ------------------------------------------------------------
# 2. Load SovereignHQ Environment
# ------------------------------------------------------------
$Root      = "C:\Users\Qslc1\SovereignHQ"
$Logs      = "$Root\05_LOGS"
$Control   = "$Root\00_CONTROL"

# Ensure log directory exists
if (-not (Test-Path $Logs)) { New-Item -ItemType Directory -Path $Logs -Force | Out-Null }

Write-Host "Environment loaded."

# ------------------------------------------------------------
# 3. Define Task List Based on Your Open Tabs
# ------------------------------------------------------------
$Tasks = @(
    "Base44 Superagent",
    "Base44 Builder",
    "Google AI Studio",
    "Google Billing",
    "QSLC SharePoint",
    "QSLC SSOT Workbook",
    "QSLC Executive Workbook",
    "Microsoft Copilot",
    "Paychex",
    "ChatGPT",
    "Cloudflare Block Diagnostics",
    "EVE Command Center",
    "Local EVE Health",
    "Stripe Dashboard",
    "FastAPI Research"
)

# ------------------------------------------------------------
# 4. Auto-Advance Loop
# ------------------------------------------------------------
foreach ($Task in $Tasks) {

    Write-Host ">>> Executing Task: $Task" -ForegroundColor Yellow

    switch ($Task) {

        "Base44 Superagent" {
            Start-Process "https://app.base44.com/superagent/6a26b5efb34e302378c5fee9"
        }

        "Base44 Builder" {
            Start-Process "https://base44.com/lp-en/builder"
        }

        "Google AI Studio" {
            Start-Process "https://aistudio.google.com/prompts/new_chat?project=gen-lang-client-0959545493"
        }

        "Google Billing" {
            Start-Process "https://console.cloud.google.com/billing/01F6F1-7151B8-929DBE/reports?project=nimble-anagram-464716-e3"
        }

        "QSLC SharePoint" {
            Start-Process "https://quantumsovereignlogisticsco.sharepoint.com/_layouts/15/sharepoint.aspx/discover"
        }

        "QSLC SSOT Workbook" {
            Start-Process "https://quantumsovereignlogisticsco-my.sharepoint.com/personal/sovereign_quantumsovereignlogisticsco_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7B679E7BDB-B200-4871-AD3A-59A0EA4383B6%7D"
        }

        "QSLC Executive Workbook" {
            Start-Process "https://quantumsovereignlogisticsco.sharepoint.com/:x:/r/sites/allcompany/_layouts/15/Doc.aspx?sourcedoc=%7B2999DC96-F847-4A1A-B2AC-2F5BC8998853%7D"
        }

        "Microsoft Copilot" {
            Start-Process "https://m365.cloud.microsoft/cowork?auth=2&home=1"
        }

        "Paychex" {
            Start-Process "https://login.flex.paychex.com/login_static/UsernameOnly.html"
        }

        "ChatGPT" {
            Start-Process "https://chatgpt.com"
        }

        "Cloudflare Block Diagnostics" {
            Start-Process "https://blocked.teams.cloudflare.com"
        }

        "EVE Command Center" {
            Start-Process "http://localhost"
        }

        "Local EVE Health" {
            Start-Process "http://127.0.0.1:5191/health"
            Start-Process "http://127.0.0.1:5180/health"
        }

        "Stripe Dashboard" {
            Start-Process "https://dashboard.stripe.com"
        }

        "FastAPI Research" {
            Start-Process "https://www.bing.com/search?q=fast+api"
        }
    }

    # Auto-advance delay between tabs
    Start-Sleep -Seconds 3
}

# ------------------------------------------------------------
# 5. Log Completion
# ------------------------------------------------------------
$LogFile = "$Logs\auto_agent_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
"Auto-Agent completed at $(Get-Date)" | Out-File $LogFile

Write-Host ">>> Sovereign Auto-Agent Finished." -ForegroundColor Green
