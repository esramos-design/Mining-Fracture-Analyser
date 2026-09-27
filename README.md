<div align="center">
<h1 align="center">Mining Fracture Analyser (MFA) v5.36.0</h1>
<p align="center">
<strong>Deterministic solo and cooperative mining fracture planning for Star Citizen.</strong>
<br />
Can I break this rock? If not, what exact loadout and how many assisting ships are required?
<br /><br />
<a href="https://github.com/esramos-design/Mining-Fracture-Analyser/blob/main/LICENSE" target="_blank">
<img alt="License: GPL-3.0" src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" />
</a>
<img alt="Status: Active" src="https://img.shields.io/badge/status-active-success.svg" />
<img alt="MFA: 5.36.0" src="https://img.shields.io/badge/MFA-5.36.0-2E5D88" />
<img alt="Star Citizen: 4.10.1" src="https://img.shields.io/badge/Star%20Citizen-4.10.1-orange" />
<br /><br />
<a href="https://mining-fracture-analyser.pages.dev/" target="_blank">🔴 <strong>Launch MFA Web App</strong></a>
|
<a href="https://mining-fracture-analyser.pages.dev/fleet.html" target="_blank">🚢 <strong>Fleet Roster</strong></a>
|
<a href="https://github.com/esramos-design/Mining-Fracture-Analyser/issues" target="_blank">🐛 Report Bug</a>
</p>
</div>

# ⛏️ Mining Fracture Analyser (MFA)

**Mining Fracture Analyser (MFA)** is an open-source mining fracture calculator and cooperative fleet planner for Star Citizen.

Its primary purpose is to answer four operational questions:

1. **Can the target rock be fractured by the current ship/loadout?**
2. **What is the best solo loadout for the target?**
3. **If solo fracture is not viable, how many additional mining ships are required?**
4. **What exact mining head, module state, gadget and vessel configuration should each assisting ship use?**

MFA separates the **actual operation fleet** from the **ideal recommendation engine**. The Fleet Planner describes what is really present and fitted; Recommended Solutions determines an ideal target-driven plan from the rock and mission constraints.

---

## Current release

- **MFA:** 5.36.0
- **Star Citizen target:** 4.10.1 LIVE
- **Reference build:** 4.10.1-LIVE.12660092
- **Deployment:** Cloudflare Pages
- **AI dependency:** none
- **Standalone Windows build:** discontinued

### 4.10.1 calculation audit

MFA v5.36.0 includes the 4.10.1 mechanics audit completed on 27 September 2026.

The audit corrected an important resistance-direction error in the previous fracture formula. MFA now treats resistance as a penalty on delivered fracture power and sums each active mining head's effective contribution independently for cooperative mining.

The numerical fracture model is explicitly documented as a **community-calibrated deterministic model**, not an official CIG-published equation.

See:

- [4.10.1 Mining Mechanics Audit](docs/AUDIT_4.10.1_2026-09-27.md)
- [Calculation Authority Contract](docs/CALCULATION_AUTHORITY.md)
- [Data Integrity Contract](docs/DATA_INTEGRITY_CONTRACT.md)

---

## Core features

### 🎯 Target Acquisition

Target values currently include:

- Rock Mass
- Base Resistance
- Base Instability
- Material / composition reference
- Active Gadget
- Mission constraints

**Manual entry is the authoritative/recommended acquisition method for v5.36.0.**

The screenshot OCR scanner remains available as an experimental helper, but it is not yet considered reliable across all Prospector, MOLE and Golem HUD layouts, resolutions and HUD colours. A dedicated 4.10.1 Target Acquisition/OCR rebuild is planned using team-captured screenshots.

### 🚢 Unified Fleet Planner

The Fleet Planner represents the **actual operation**:

- vessel quantity;
- individual vessel cards;
- actual fitted mining heads;
- actual fitted modules;
- module activation state;
- vessel status:
  - **Active** — currently contributing to fracture;
  - **Available** — can assist;
  - **Standby** — excluded from the current fracture calculation.

Supported mining vessels include the Prospector, ARGO MOLE and Drake Golem.

### 🧮 Fracture Verdict

The deterministic engine calculates:

- raw available laser power;
- effective delivered power;
- effective resistance;
- instability display value;
- required raw power;
- maximum breakable mass;
- fracture viable / not viable.

### 🧠 Recommended Solutions

Recommended Solutions is **target-driven** and does not use the Fleet Planner as a recommendation source.

It returns one best ideal plan containing:

- exact vessel count;
- exact vessel type;
- exact mining head per active arm;
- exact module slots;
- Active module ON/OFF requirements;
- gadget requirement;
- calculated fracture capacity and margin;
- per-vessel **Available to assist** confirmation.

The user can then reproduce that ideal plan in the actual Fleet Planner for parity checking.

### 📚 Mining database

The current staged 4.10.1 tables contain:

- 17 mining laser heads;
- 26 functional mining modules;
- 6 mining gadgets.

Unknown or unverified attributes remain `null` rather than being guessed.

### 🎨 Planner themes

MFA provides:

- Planner Day
- Planner Dusk
- Planner Night

Theme work is presentation-only and does not alter calculation state.

---

## How to use MFA

A full operational guide is available here:

👉 [MFA v5.36.0 User Guide](docs/USER_GUIDE.md)\n\n👉 [Recommended Ideal Loadout — Public Mechanics Guide](docs/RECOMMENDED_IDEAL_LOADOUT_MECHANICS.md)

Quick workflow:

1. Open the web app.
2. Enter the target rock's **Mass, Resistance and Instability** manually.
3. Select any gadget already applied to the rock.
4. Define mission constraints.
5. Configure the **actual Fleet Planner** if you want to test the current operation.
6. Read the **Fracture Verdict**.
7. Read **Recommended Solutions** for the ideal loadout.
8. If MFA recommends additional ships, confirm which recommended vessels are actually available.
9. Reproduce the recommendation exactly in Fleet Planner if you want to verify parity before the operation.

---

## Target Acquisition / OCR status

The legacy screenshot scanner currently uses fixed crop/anchor assumptions and can fail with:

- different mining HUD positions;
- different ships;
- different resolutions;
- different HUD colours;
- bright or complex rock backgrounds;
- modified/current resistance values instead of base values;
- composition blocks containing multiple materials.

Until the planned scanner rebuild is validated against real 4.10.1 screenshots, **critical target values should be visually verified before relying on the solver**.

Planned validation fixtures:

- Prospector fully scanned rock;
- MOLE fully scanned rock;
- Golem fully scanned rock where available;
- normal player resolutions;
- screenshots taken before laser activation where possible.

---

## Web deployment

The maintained application is the Cloudflare web version:

**https://mining-fracture-analyser.pages.dev/**

Repository:

**https://github.com/esramos-design/Mining-Fracture-Analyser**

Branch workflow:

- `alpha` — active development / Cloudflare validation
- `main` — release source after protected promotion

The obsolete `mfa.github.io` repository and standalone Windows executable are no longer maintained.

---

## AI usage

The public MFA application has **no AI runtime dependency**.

The former Foreman AI integration has been removed. MFA does not require:

- OpenAI API credits;
- Cloudflare Workers AI;
- Gemini API keys;
- user-supplied AI credentials.

Fracture verdicts and Recommended Solutions are deterministic.

---

## Testing and integrity

Protected checks include:

- **Operation Console**
- **Data Integrity**
- **Regression Tests**

Important regression coverage includes:

- resistance monotonicity;
- active/passive module semantics;
- gadget modifiers;
- multi-head cooperative power;
- shared core/browser runtime parity;
- Recommended Solutions vs copied Fleet Planner loadout parity.

---

## Contributing

Contributions are welcome, especially:

- current mining data corrections;
- controlled in-game fracture test fixtures;
- Target Acquisition/OCR screenshots and test cases;
- reproducible calculation bugs;
- accessibility and contrast fixes;
- documentation improvements.

See [CONTRIBUTING.md](CONTRIBUTING.md).

For security issues, follow [SECURITY.md](SECURITY.md).

---

## License & credits

- **License:** [GNU General Public License v3.0](LICENSE)
- **Lead Developer / Maintainer:** [Esramos Design](https://github.com/esramos-design)
- **Mining data references:** UEXCorp, RSI/CIG public information and community mining research used in the documented audit

**Disclaimer:** MFA is a fan-made open-source community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games or Roberts Space Industries.

*Fly Safe. Crack Hard.*
