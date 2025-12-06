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
</p>
</div>

</div>



# **Contributing Guidelines**

First off, thanks for taking the time to contribute! 🎉

The Mining Fracture Analyser is a community tool built for Star Citizen players. We welcome contributions from developers of all skill levels.

## **📂 Project Structure (v5.15)**

The project has been refactored for stability and modularity:

* **index.html**: Main structure. Contains the **Locked Header** and the 4-Column Grid Layout.
* **style.css**: Contains the **Logofolio Palette** variables (`--bg-main: #0D0D0D`) and responsive grid logic.
* **script.js**: **THE CORE ENGINE.** Contains:
  * Database (Ships, Lasers, Modules).
  * Calculation Logic.
  * **Strict Filtering:** Logic to ensure Prospectors only see S1 lasers, MOLEs only see S2.
  * AI Integration (Gemini API).
* **scanner.js**: **THE OPTICAL ENGINE.** Contains:
  * **File Upload Logic** (No video streaming).
  * **Image Pre-processing:** Uses Inverted Grayscale and Dual-Zone Cropping.
  * Tesseract.js implementation with strict Regex parsing.

## **🚀 How Can I Contribute?**

### **1. Reporting Bugs**
* **Include details:** Browser version, screen resolution (if OCR failed), and the specific rock parameters.

### **2. Pull Requests**
1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## **💻 Development Focus Areas**

### **1. Updating Mining Data**
If CIG changes mining values, update the `allLaserHeads`, `powerModules`, or `gadgets` arrays in **script.js**.

### **2. Improving OCR (scanner.js)**
We currently use a **2.5x scale factor** and **Inverted Grayscale** processing.
* The logic uses a **Dual-Zone Crop** (Left 35% + Right 35%) to cut out the center crosshair noise.
* If you improve the Regex, ensure it handles "floating" numbers typical of the Drake Golem HUD.

### **3. Reactive UI**
The "Optimized Fleet Loadouts" in `script.js` uses conditional logic (`if (inst > 60)...`). If adding new logic, ensure you provide a fallback "Standard" case.

## **⚖️ License**
By contributing, you agree that your contributions will be licensed under its GNU General Public License (GPL).