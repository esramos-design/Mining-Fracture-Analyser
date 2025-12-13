<div align="center">
<h1 align="center">Mining Fracture Analyser (MFA) v5.35</h1>
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
</p><br />
</div>

# **⛏️ Mining Fracture Analyser (MFA)**

**The ultimate tactical dashboard and calculation engine for industrial mining crews in Star Citizen.**

The **Mining Fracture Analyser (MFA)** is a web-based tool designed to remove guesswork from high-stakes mining operations. It calculates **Total Combined Effective Laser Power (MW)** in real-time, accounting for ship hulls, laser heads, active/passive modules, gadgets, and rock resistance.

**Version 5.35** introduces the **Fleet Roster System**, **Dynamic Module Slot Locking**, and the new **Dynamic Channel OCR Engine** for reading difficult scanners.

---

## **🚀 Key Features (v5.35)**

### **📷 Optical Scanner (OCR v5.35)**
* **Dynamic Channel Isolation:** The new scanning engine (v5.35) automatically detects the strongest color channel (Red, Green, or White) to read UI text against any background.
* **Contrast Crushing:** Aggressively filters out grey rock textures to ensure accurate readings on Lyria/Wala.
* **Anchor Logic:** Uses the "%" symbol to intelligently locate Mass and Instability values, even if the labels are obscured.

### **🚢 Fleet Roster System**
A dedicated dashboard for managing your organization's industrial assets.
* **Live Manifest:** Tracks **Prospector**, **MOLE**, and **Drake Golem** fleets.
* **Advanced Telemetry:** View detailed component breakdowns (Shields, Coolers, Power Plants) and emissions data.
* **Command Dashboard:** Aggregates total cargo capacity, active mining heads, and fleet mass instantly.

### **🛠️ Strict Fleet Configuration**
* **Dynamic Slot Locking:** The module slots now automatically lock/unlock based on your chosen Laser Head.
* **Smart Filtering:** The ship selector strictly enforces hardpoint sizes (S1 for Prospector, S2 for MOLE).

### **🧠 Reactive Dynamic Loadouts**
The **Optimized Fleet Loadouts** panel reacts instantly to changes in Mass, Resistance, or Instability:
* **Hazard Protocols:** Suggests "BoreMax" or "Lancet" builds if **Instability exceeds 60%**.
* **Power Protocols:** Switches to "Surge" patterns if **Resistance exceeds 40%** or fleet power is insufficient.

### **🤖 AI Foreman 2.0**
* **Gemini 2.5 Flash Uplink:** Powered by Google's latest model for fast, context-aware tactical reasoning.

---

## **📖 How to Use**

### **1. Initialization**
1. Launch the dashboard.
2. Click **"AUTH KEY"** in the AI Foreman panel.
3. Paste your free **Google Gemini API Key**.

### **2. Input Data (Manual or Scan)**
* **Manual:** Enter Mass, Resistance, and Instability in the **Target Analysis** panel.
* **Optical Scan:** Drag and drop a screenshot of your mining HUD into the window.
* **Gadgets:** Toggle any active gadgets attached to the rock.

### **3. Deploy Fleet**
* **Add Ships:** Use the **Fleet Config** panel to add ships.
* **Fit Loadouts:** Select Laser Heads and Modules.

### **4. Execute**
* **Check Telemetry:** If the banner is **GREEN**, you have enough power.
* **Consult AI:** Click **"🧠 STRATEGY"** for a second opinion on safety.

---

## **🛠️ Installation & Deployment**

### **🌐 Option 1: Live Web Version (Recommended)**
The tool is a Progressive Web App (PWA) compatible with any modern browser.
👉 [Launch MFA Dashboard](https://esramos-design.github.io/mfa.github.io/)

### **💻 Option 2: Standalone Windows App**
**Desktop App:** Get the updated standalone Windows executable.  
📥 [**DOWNLOAD MFA v5.35 EXE HERE**](https://github.com/esramos-design/Mining-Fracture-Analyser/releases/tag/v5.35-release)

---

## **⚖️ License & Credits**
* **Lead Developer:** [Esramos Design](https://github.com/esramos-design)
* **Mining Data:** Verified against [**Regolith.rocks**](https://regolith.rocks/) and [**UEXCorp**](https://uexcorp.space/).
* **UI Design:** Logofolio "Obsidian" Dark Mode.
* **AI Backend:** Powered by Google Gemini 2.5 Flash.

**Disclaimer:** This project is a fan-made tool and is not affiliated with Cloud Imperium Games (CIG) or Roberts Space Industries (RSI).

*Fly Safe. Crack Hard.*