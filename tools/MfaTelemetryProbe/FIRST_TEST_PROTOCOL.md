# First controlled mining telemetry session

Use this test before changing MFA away from OCR.

## Goal

Determine, with repeatable evidence, whether Star Citizen 4.10.1 LIVE writes any of the following into `Game.log`:

- target/rock identity;
- rock mass;
- resistance;
- instability;
- mining laser/head identity;
- module activation;
- mining gadget state;
- fracture state;
- extraction state;
- cargo/resource changes.

A keyword match alone is not sufficient. A field becomes trusted MFA telemetry only when repeated controlled actions correlate with stable log output.

## Before launch

1. Start the telemetry probe.
2. Confirm the console says it is following `Game.log`.
3. Keep a second PowerShell window open in:
   `tools\MfaTelemetryProbe`

Use `mark-action.ps1` immediately before or after each controlled action.

Example:

```powershell
.\mark-action.ps1 -Action "SCAN_ROCK" -Notes "On screen: mass 23922, resistance 16%, instability 20%"
```

The marker is written into the latest probe session folder as `markers.jsonl`.

## Test sequence

Prefer one ship, one rock and one mining head for the first test.

1. `GAME_READY`
2. `ENTER_SHIP`
3. `POWER_MINING_SYSTEM`
4. `ENTER_MINING_MODE`
5. `TARGET_ROCK`
6. `SCAN_ROCK`
   - record visible mass;
   - record visible resistance;
   - record visible instability;
   - record material composition if visible.
7. `LASER_ON`
8. `LASER_OFF`
9. activate one mining module:
   `MODULE_ON:<name>`
10. deactivate it:
   `MODULE_OFF:<name>`
11. if using a gadget:
   `GADGET_APPLIED:<name>`
12. `FRACTURE_BEGIN`
13. `OPTIMAL_ZONE_ENTER`
14. `OPTIMAL_ZONE_EXIT`
15. `FRACTURE_COMPLETE` or `FRACTURE_ABORT`
16. `EXTRACTION_BEGIN`
17. `EXTRACTION_STOP`
18. `CARGO_CHECK`
19. `SESSION_END`

Pause for around 3–5 seconds between major actions where practical. This makes temporal correlation easier.

## What to send back for analysis

The most useful files are:

- `session.json`
- `markers.jsonl`
- `candidates.jsonl`

Only provide `events.jsonl` if candidate lines are insufficient.

Review files before sharing them. Raw Star Citizen logs can contain account/session/server/system diagnostics.

## Evidence classification

Each candidate telemetry field will receive one status:

- **Verified live** — repeated and unambiguous.
- **Probable** — correlated but requires another controlled test.
- **Observed, not usable** — present but too unstable/indirect.
- **Not exposed** — no reliable source found in controlled captures.

Only **Verified live** fields will be eligible to replace OCR.
