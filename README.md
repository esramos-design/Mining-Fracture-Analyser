<div align="center">
<h1 align="center">Mining Fracture Analyser (MFA) v5.35</h1>
<p align="center">
<strong>A real-time cooperative mining calculator & fleet manager for Star Citizen.</strong>
<br />
Stop Guessing. Start Fracturing.
<br />
<br />
<a href="https://github.com/esramos-design/Mining-Fracture-Analyser/blob/main/LICENSE" target="_blank">
<img alt="License: GPL-3.0" src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" />
</a>
<img alt="Status: Active" src="https://img.shields.io/badge/status-active-success.svg" />
<img alt="Game: Star Citizen" src="https://img.shields.io/badge/Star%20Citizen-4.4+-orange" />
<br />
<br />
<a href="https://esramos-design.github.io/mfa.github.io/" target="_blank">🔴 <strong>Launch Live Demo</strong></a>
|
<a href="https://esramos-design.github.io/mfa.github.io/fleet.html" target="_blank">🚢 <strong>Fleet Roster</strong></a>
|
<a href="https://github.com/esramos-design/Mining-Fracture-Analyser/issues" target="_blank">🐛 Report Bug</a>
</p><br />
</div>

# ⛏️ Mining Fracture Analyser (MFA)

**Mining Fracture Analyser (MFA)** is an open-source tactical dashboard and calculation engine for cooperative industrial mining crews in Star Citizen.

It is designed to reduce guesswork during mining operations by calculating **Total Combined Effective Laser Power (MW)** in real time, accounting for ship hulls, laser heads, active and passive modules, gadgets, and rock resistance.

Version 5.35 introduces the **Fleet Roster System**, **Dynamic Module Slot Locking**, and the **Dynamic Channel OCR Engine** for extracting values from difficult scanner screenshots.

---

## 🚀 Key Features

### 📷 Optical Scanner (OCR v5.35)
- **Dynamic Channel Isolation:** detects the strongest usable colour channel to improve text extraction.
- **Contrast Processing:** suppresses background rock texture to improve scanner readability.
- **Anchor Logic:** uses recognised HUD markers such as the percentage symbol to locate relevant values even when labels are partially obscured.

### 🚢 Fleet Roster System
- Tracks supported mining ships including the **Prospector**, **MOLE**, and **Drake Golem**.
- Displays component, cargo, mining-head, and fleet data.
- Aggregates fleet-level mining capability for cooperative crews.

### 🛠️ Strict Fleet Configuration
- Dynamically locks or unlocks compatible module slots according to the selected laser head.
- Enforces supported hardpoint sizes and configuration constraints.

### 🧠 Reactive Dynamic Loadouts
The optimisation panel reacts to Mass, Resistance, Instability, and available fleet power to surface loadout suggestions.

### 🤖 AI Foreman
Optional AI-assisted tactical guidance is available through a user-supplied Google Gemini API key.

---

## 📖 How to Use

### 1. Launch
Open the live web application or a supported standalone build.

### 2. Enter target data
- **Manual:** enter Mass, Resistance, and Instability.
- **Optical Scan:** drag and drop a screenshot of the mining HUD.
- **Gadgets:** select any active gadgets applied to the rock.

### 3. Configure the fleet
Add ships, mining heads, and modules representing the active crew configuration.

### 4. Review the result
Use the calculated telemetry and loadout guidance as operational assistance.

> MFA is a community tool. Game mechanics can change between Star Citizen releases, so users should verify critical values against current in-game behaviour.

---

## 🧩 Project Scope

MFA is maintained as a community-focused open-source utility for Star Citizen mining. Its main engineering areas include:

- browser-based calculation and state-management logic;
- OCR and image preprocessing for HUD screenshots;
- ship, laser-head, module, gadget, and mining-data modelling;
- cooperative fleet configuration and optimisation;
- Progressive Web App deployment;
- optional AI-assisted guidance.

The project aims to remain useful to individual miners, multi-crew operators, and community organisations while keeping its calculation logic inspectable and improvable by contributors.

---

## 💻 Installation & Deployment

### 🌐 Live Web Version
The tool is available as a Progressive Web App compatible with modern browsers.

👉 [Launch MFA Dashboard](https://esramos-design.github.io/mfa.github.io/)

### 🖥️ Standalone Windows Build
Published standalone builds are available from the repository releases.

📥 [Download MFA v5.35](https://github.com/esramos-design/Mining-Fracture-Analyser/releases/tag/v5.35-release)

---

## 🤝 Contributing

Contributions are welcome.

Useful contributions include:

- corrections to mining data;
- reproducible bug reports;
- OCR test cases and scanner screenshots that do not contain sensitive information;
- accessibility and usability improvements;
- documentation improvements;
- code fixes and feature proposals.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For security issues, follow the private-reporting guidance in [SECURITY.md](SECURITY.md) rather than opening a public issue.

---

## 🔐 Security & API Keys

MFA may use third-party APIs for optional features. Contributors and users must never commit API keys, authentication tokens, passwords, or other secrets to the repository.

User-supplied API credentials should remain under the user's control and should not be included in bug reports, screenshots, logs, or pull requests.

See [SECURITY.md](SECURITY.md) for vulnerability-reporting guidance.

---

## 🗺️ Maintainer Workflow

The project is actively maintained through GitHub. Planned open-source maintenance work includes:

- issue triage and reproducible test cases;
- pull-request review;
- regression testing;
- documentation maintenance;
- release preparation;
- security review;
- contributor onboarding;
- automation for routine repository maintenance.

AI-assisted development tools may be used to support these workflows, but project changes remain subject to maintainer review.

---

## ⚖️ License & Credits

- **License:** [GNU General Public License v3.0](LICENSE)
- **Lead Developer / Maintainer:** [Esramos Design](https://github.com/esramos-design)
- **Mining Data References:** [Regolith.rocks](https://regolith.rocks/) and [UEXCorp](https://uexcorp.space/)
- **AI Integration:** optional Google Gemini integration

**Disclaimer:** This is a fan-made open-source community project and is not affiliated with, endorsed by, or sponsored by Cloud Imperium Games (CIG) or Roberts Space Industries (RSI).

*Fly Safe. Crack Hard.*
