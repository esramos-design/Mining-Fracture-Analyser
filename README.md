<div align="center">
<h1 align="center">Mining Fracture Analyser (MFA) v5.24</h1>
<p align="center">
<strong>A real-time cooperative mining calculator & fleet manager for Star Citizen.</strong>
<br />
Stop Guessing. Start Fracturing.
<br />
<br />
<a href="https://github.com/esramos-design/mfa.github.io/blob/main/LICENSE" target="_blank">
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
<a href="https://github.com/esramos-design/mfa.github.io/issues" target="_blank">🐛 Report Bug</a>
|
<a href="https://github.com/esramos-design/mfa.github.io/issues" target="_blank">✨ Request Feature</a>
</p><br />
</div>

# **⛏️ Mining Fracture Analyser (MFA)**

**The ultimate tactical dashboard and calculation engine for industrial mining crews in Star Citizen.**

The **Mining Fracture Analyser (MFA)** is a web-based tool designed to remove guesswork from high-stakes mining operations. It calculates **Total Combined Effective Laser Power (MW)** in real-time, accounting for ship hulls, laser heads, active/passive modules, gadgets, and rock resistance.

**Version 5.24** introduces the **Fleet Roster System**, **Dynamic Module Slot Locking**, support for the **Drake Golem**, and a finalized **Optical Scanning Engine**.

---

## **🚀 Key Features (v5.24)**

### **🚢 Fleet Roster System (New!)**
A dedicated dashboard for managing your organization's industrial assets.
* **Live Manifest:** Tracks **Prospector**, **MOLE**, and **Drake Golem** fleets.
* **Advanced Telemetry:** View detailed component breakdowns (Shields, Coolers, Power Plants) and emissions data.
* **Command Dashboard:** Aggregates total cargo capacity, active mining heads, and fleet mass instantly.
* **Visual Identity:** Cinematic headers and manufacturer-specific branding for every ship card.

### **🛠️ Strict Fleet Configuration**
* **Dynamic Slot Locking:** The module slots now automatically lock/unlock based on your chosen Laser Head to match in-game hardpoints.
    * **Helix II / Impact II:** Unlocks 3 Module Slots.
    * **Lancet MH2 / Arbor MH2:** Unlocks 2 Module Slots (Slot 3 is disabled).
    * **Standard S1:** Unlocks 1 Module Slot (Slots 2 & 3 are disabled).
* **Smart Filtering:** The ship selector strictly enforces hardpoint sizes (S1 for Prospector, S2 for MOLE).

### **🧠 Reactive Dynamic Loadouts**
The **Optimized Fleet Loadouts** panel reacts instantly to changes in Mass, Resistance, or Instability:
* **Granular MOLE Configs:** Automatically assigns specific loadouts for **Head 1 (Break)**, **Head 2 (Stability)**, and **Head 3 (Extraction)** based on rock difficulty.
* **Hazard Protocols:** Suggests "BoreMax" or "Lancet" builds if **Instability exceeds 60%**.
* **Power Protocols:** Switches to "Surge" patterns if **Resistance exceeds 40%** or fleet power is insufficient.

### **📷 Optical Scanner (OCR V28)**
* **Upload & Analyze:** Replaced the unstable video scanner with a robust **File Upload / Drag-and-Drop** system.
* **Smart Crop Technology:** Automatically detects **Left (Loadout)** and **Right (Mining)** data panels, cutting out center screen noise (crosshairs/compass) for 99% accuracy.
* **Inverted Grayscale Engine:** Specifically tuned to read bright green text against bright backgrounds (Lyria/Wala).

### **🤖 AI Foreman 2.0**
* **Gemini 2.5 Flash Uplink:** Powered by Google's latest model for fast, context-aware tactical reasoning.
* **Pre-Deployment Strategy:** Query the AI before you undock.
* **Command Uplink:** Generates roleplay-ready tactical orders for in-game chat.

---

## **📖 How to Use**

### **1. Initialization**
1. Launch the dashboard.
2. Click **"AUTH KEY"** in the AI Foreman panel.
3. Paste your free **Google Gemini API Key**.

### **2. Input Data (Manual or Scan)**
* **Manual:** Enter Mass, Resistance, and Instability in the **Target Analysis** panel.
* **Optical Scan:** Click the **Camera Icon** to upload a screenshot of your mining HUD. The system will auto-fill the data.
* **Gadgets:** Toggle any active gadgets attached to the rock.

### **3. Deploy Fleet**
* **Add Ships:** Use the **Fleet Config** panel to add ships to your operation.
* **Fit Loadouts:** Select Laser Heads and Modules.
    * *Tip:* Toggle Active Modules (e.g., Surge) On/Off to simulate cooldowns.
    * *Note:* Slots will automatically lock if the chosen laser head does not support them.

### **4. Execute**
* **Check Telemetry:** If the banner is **GREEN**, you have enough power.
* **Consult AI:** Click **"🧠 STRATEGY"** for a second opinion on safety.

---

## **🛠️ Installation & Deployment**

### **🌐 Option 1: Live Web Version (Recommended)**
The tool is a Progressive Web App (PWA) compatible with any modern browser.
👉 [Launch MFA Dashboard](https://esramos-design.github.io/mfa.github.io/)

### **💻 Option 2: Standalone Windows App**
Run MFA as a native desktop application to avoid browser clutter.

1. **Install Python:** Download from [python.org](https://www.python.org/).
2. **Clone/Download:** Get the repository files.
3. **Install Dependency:** `pip install pywebview`
4. **Launch:** Double-click `run_app.py`.

---

## **🤝 Contributing Guidelines**

First off, thanks for taking the time to contribute! 🎉
The Mining Fracture Analyser is a community tool built for Star Citizen players. We welcome contributions from developers of all skill levels.

### **📂 Project Structure (v5.24)**

The project has been refactored for stability and modularity:

* **index.html**: Main structure. Contains the **Locked Header** and the 4-Column Grid Layout.
* **fleet.html**: **NEW** Fleet Roster interface with cinematic headers.
* **style.css**: Contains the **Logofolio Palette** variables (`--bg-main: #0D0D0D`) and responsive grid logic.
* **script.js**: **THE CORE ENGINE.** Contains Database (Ships, Lasers), Calculation Logic, and Strict Filtering.
* **fleet.js**: **THE MANIFEST ENGINE.** Contains deep JSON ship data and parser logic for the Roster page.
* **scanner.js**: **THE OPTICAL ENGINE.** Tesseract.js implementation with strict Regex parsing.
* **ai-foreman.js**: Handles Google Gemini API calls and context prompting.

### **🚀 How Can I Contribute?**
1. **Reporting Bugs:** Include browser version, screen resolution (if OCR failed), and specific rock parameters.
2. **Pull Requests:**
    * Fork the Project
    * Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
    * Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
    * Push to the Branch (`git push origin feature/AmazingFeature`)
    * Open a Pull Request

### **💻 Development Focus Areas**
* **Updating Mining Data:** If CIG changes mining values, update the `allLaserHeads`, `powerModules`, or `gadgets` arrays in **script.js**.
* **Improving OCR (scanner.js):** We currently use a **2.0x scale factor** and **Inverted Grayscale** processing. If you improve the Regex, ensure it handles "floating" numbers typical of the Drake Golem HUD.
* **Reactive UI:** The "Optimized Fleet Loadouts" in `script.js` uses conditional logic (`if (inst > 60)...`). If adding new logic, ensure you provide a fallback "Standard" case.

---

## **⚖️ License & Credits**

* **Lead Developer:** [Esramos Design](https://github.com/esramos-design)
* **Mining Data:** Verified against [**Regolith.rocks**](https://regolith.rocks/) and [**UEXCorp**](https://uexcorp.space/).
* **UI Design:** Logofolio "Obsidian" Dark Mode.
* **AI Backend:** Powered by Google Gemini 2.5 Flash.

**Disclaimer:** This project is a fan-made tool and is not affiliated with Cloud Imperium Games (CIG) or Roberts Space Industries (RSI).

*Fly Safe. Crack Hard.*
