<div align="center">
<h1 align="center">Mining Fracture Analyser (MFA) v5.15</h1>
<p align="center">
<strong>A real-time cooperative mining calculator for Star Citizen.</strong>
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
<a href="https://github.com/esramos-design/mfa.github.io/issues" target="_blank">🐛 Report Bug</a>
|
<a href="https://github.com/esramos-design/mfa.github.io/issues" target="_blank">✨ Request Feature</a>
</p><br />
</div>

# **⛏️ Mining Fracture Analyser (MFA)**

**The ultimate tactical dashboard and calculation engine for industrial mining crews in Star Citizen.**

The **Mining Fracture Analyser (MFA)** is a web-based tool designed to remove guesswork from high-stakes mining operations. It calculates **Total Combined Effective Laser Power (MW)** in real-time, accounting for ship hulls, laser heads, active/passive modules, gadgets, and rock resistance.

**Version 5.15** introduces a rock-solid **Upload-Only OCR Scanner**, **Reactive Loadout Strategies**, and a strictly typed **Fleet Configuration** engine.

## **🚀 Key Features (v5.15)**

### **🧠 Reactive Dynamic Loadouts**
The **Optimized Fleet Loadouts** panel (Column 2) reacts instantly to changes in Mass, Resistance, or Instability:
* **Granular MOLE Configs:** Automatically assigns specific loadouts for **Head 1 (Break)**, **Head 2 (Stability)**, and **Head 3 (Extraction)** based on rock difficulty.
* **Hazard Protocols:** Suggests "BoreMax" or "Lancet" builds if **Instability exceeds 60%**.
* **Power Protocols:** Switches to "Surge" patterns if **Resistance exceeds 40%** or fleet power is insufficient.

### **📷 Optical Scanner (OCR V23)**
* **Upload & Analyze:** We have replaced the unstable video scanner with a robust **File Upload / Drag-and-Drop** system.
* **Smart Crop Technology:** The scanner automatically detects **Left (Loadout)** and **Right (Mining)** data panels, cutting out the center screen noise (crosshairs/compass) for 99% accuracy.
* **Inverted Grayscale Engine:** Specifically tuned to read bright green text against the bright grey/white backgrounds of moons like Lyria or Wala.

### **🛠️ Strict Fleet Configuration**
* **Smart Filtering:** The ship selector now strictly enforces hardpoint sizes:
    * **Prospector:** Only displays **Size 1** lasers.
    * **MOLE:** Only displays **Size 2** lasers.
    * **Golem:** Locked to the integrated **Pitman** laser.

### **🤖 AI Foreman 2.0**
* **Gemini 2.5 Flash Uplink:** Powered by Google's latest model for fast, context-aware tactical reasoning.
* **Pre-Deployment Strategy:** Query the AI before you undock.
* **Command Uplink:** Generates roleplay-ready tactical orders for in-game chat.

### **📊 Advanced Telemetry**
* **Power vs. Margin:** Visual bar graph comparing your fleet's output against the rock's break threshold.
* **Risk Profile:** Doughnut chart visualizing the danger zone (Resistance vs. Instability).
* **Resistance Curve:** Line graph tracking power requirements across the heating phase.
* **Dynamic Feedback:** Instant "Success/Failure" banners with exact mass over/under calculations.

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

### **4. Execute**
* **Check Telemetry:** If the banner is **GREEN**, you have enough power.
* **Consult AI:** Click **"🧠 STRATEGY"** for a second opinion on safety.

## **🛠️ Installation & Deployment**

### **🌐 Option 1: Live Web Version (Recommended)**
The tool is a Progressive Web App (PWA) compatible with any modern browser.
👉 [Launch MFA Dashboard](https://esramos-design.github.io/mfa.github.io/)

### **💻 Option 2: Standalone Windows App**
Run MFA as a native desktop application to avoid browser clutter.

1. **Install Python:** Download from [python.org](https://www.python.org/).
2. **Clone/Download:** Get the index.html, style.css, script.js, scanner.js, and run_app.py files.
3. **Install Dependency:** `pip install pywebview`
4. **Launch:** Double-click `run_app.py`.

## **🤝 Credits & Data Sources**
* **Lead Developer:** [Esramos Design](https://github.com/esramos-design)
* **Mining Data:** Verified against [**Regolith.rocks**](https://regolith.rocks/) and [**UEXCorp**](https://uexcorp.space/).
* **UI Design:** Logofolio "Obsidian" Dark Mode.
* **AI Backend:** Powered by Google Gemini 2.5 Flash.

## **⚠️ Disclaimer**
This project is a fan-made tool and is not affiliated with Cloud Imperium Games (CIG) or Roberts Space Industries (RSI).

*Fly Safe. Crack Hard.*