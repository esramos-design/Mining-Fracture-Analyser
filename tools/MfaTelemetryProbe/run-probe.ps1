param(
    [string]$GameLog = "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Game.log",
    [string]$Output = "",
    [switch]$FromStart,
    [switch]$CandidatesOnly
)

$ErrorActionPreference = "Stop"
$project = Join-Path $PSScriptRoot "MFA.TelemetryProbe.csproj"

$argsList = @(
    "run",
    "--project", $project,
    "--",
    "--path", $GameLog
)

if ($Output) {
    $argsList += @("--output", $Output)
}

if ($FromStart) {
    $argsList += "--from-start"
}

if ($CandidatesOnly) {
    $argsList += "--candidates-only"
}

Write-Host "Starting MFA Telemetry Probe..." -ForegroundColor Cyan
Write-Host "Game.log: $GameLog"
Write-Host ""

& dotnet @argsList
exit $LASTEXITCODE
