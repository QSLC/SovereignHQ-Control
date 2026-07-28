#requires -Version 7.0
<#
Read-only local search for bridge/treasury keywords across text files.
Does not modify, delete, upload, or transmit anything - it only prints
matches to the console (and optionally a log file) so findings can be
copied into 08_EVIDENCE_INDEX/BRIDGE_TRACKER.csv by hand.
#>
[CmdletBinding()]
param(
  [string]$Root = 'C:\',
  [string]$LogPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$keywords = @(
  'wormhole','portal','mayan','debridge','stargate','layerzero','bridge',
  '21000','21,000','PSI',
  'DD86RjWgu4FWgdZqJYb8cnby5f341xewmzMtFeHHpump'
)

$extensions = '.txt', '.csv', '.json', '.md', '.log'

$results = Get-ChildItem -Path $Root -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $extensions -contains $_.Extension } |
  ForEach-Object {
    Select-String -Path $_.FullName -Pattern $keywords -SimpleMatch -ErrorAction SilentlyContinue
  }

$results | Format-Table Path, LineNumber, Line -AutoSize

if ($LogPath) {
  $results | Export-Csv -Path $LogPath -NoTypeInformation -Encoding UTF8
  Write-Host "Wrote $($results.Count) matches to $LogPath"
}
