param(
    [Parameter(Mandatory=$true)]
    [string]$Action,

    [string]$Notes = "",

    [string]$SessionFolder = ""
)

$ErrorActionPreference = "Stop"

if (-not $SessionFolder) {
    $root = Join-Path $env:LOCALAPPDATA "MFA\TelemetryProbe"
    if (-not (Test-Path $root)) {
        throw "TelemetryProbe folder not found: $root"
    }

    $latest = Get-ChildItem $root -Directory |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latest) {
        throw "No telemetry probe session folders were found."
    }

    $SessionFolder = $latest.FullName
}

if (-not (Test-Path $SessionFolder)) {
    throw "Session folder not found: $SessionFolder"
}

$record = [ordered]@{
    markedUtc = [DateTimeOffset]::UtcNow.ToString("o")
    markedLocal = [DateTimeOffset]::Now.ToString("o")
    action = $Action
    notes = $Notes
}

$line = $record | ConvertTo-Json -Compress
$path = Join-Path $SessionFolder "markers.jsonl"
Add-Content -Path $path -Value $line -Encoding UTF8

Write-Host ("MARKED {0}: {1}" -f $record.markedLocal, $Action) -ForegroundColor Green
if ($Notes) {
    Write-Host ("Notes: {0}" -f $Notes)
}
Write-Host ("File: {0}" -f $path)
