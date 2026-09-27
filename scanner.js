/**
 * MFA OCR Scanner — dual engine ALPHA
 *
 * Primary: Regolith-compatible PaddleOCR (PP-OCRv4)
 * Fallback/shadow comparator: MFA legacy Tesseract OCR
 *
 * OCR supplies Target Acquisition values only. No fracture mechanics,
 * Fleet Planner state, or recommendation logic is changed here.
 */

(function loadTesseract() {
    if (typeof Tesseract !== "undefined") return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    document.head.appendChild(script);
})();

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;
    handle.style.cursor = "move";

    function dragMouseDown(e) {
        e = e || window.event;
        if (e.target.tagName === "BUTTON") return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window.createDebugWindow = function () {
    if (document.getElementById("ocr-debug-console")) {
        document.getElementById("ocr-debug-console").style.display = "flex";
        return;
    }

    const logWin = document.createElement("div");
    logWin.id = "ocr-debug-console";
    logWin.style.cssText = "position:fixed; bottom:20px; right:20px; width:470px; height:530px; background:rgba(13,13,13,.98); color:#F2F2F2; font-family:'JetBrains Mono',monospace; font-size:11px; padding:0; z-index:99999; border:1px solid #404040; border-radius:8px; display:flex; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,.5);";

    logWin.innerHTML = `
        <div id="ocr-drag-header" style="background:linear-gradient(90deg,#404040,#0D0D0D); padding:10px; border-bottom:1px solid #404040; display:flex; justify-content:space-between; align-items:center; user-select:none; cursor:move; border-radius:8px 8px 0 0;">
            <span style="font-weight:bold; color:#fff; letter-spacing:1px;">OCR ALPHA · PADDLE + TESSERACT</span>
            <div style="display:flex; gap:5px;">
                <button onclick="window.copyLog()" style="cursor:pointer; background:#262626; color:#fff; border:1px solid #737373; padding:2px 8px; border-radius:4px; font-size:10px;">COPY</button>
                <button onclick="window.clearLog()" style="cursor:pointer; background:#262626; color:#fff; border:1px solid #737373; padding:2px 8px; border-radius:4px; font-size:10px;">CLR</button>
                <button onclick="document.getElementById('ocr-debug-console').style.display='none'" style="cursor:pointer; background:#522; color:#fff; border:1px solid #a33; padding:2px 8px; border-radius:4px; font-size:10px;">X</button>
            </div>
        </div>
        <div id="ocr-log-body" style="flex-grow:1; overflow-y:auto; padding:10px; user-select:text;"></div>
        <div id="ocr-preview-area" style="height:150px; border-top:1px solid #404040; background:#000; display:flex; justify-content:center; align-items:center; padding:5px;">
            <span style="color:#555">[LEGACY PREPROCESS PREVIEW]</span>
        </div>
    `;

    document.body.appendChild(logWin);
    makeDraggable(logWin, document.getElementById("ocr-drag-header"));
};

window.log = function (msg) {
    if (!document.getElementById("ocr-debug-console")) window.createDebugWindow();
    const box = document.getElementById("ocr-log-body");
    const entry = document.createElement("div");
    entry.style.borderBottom = "1px solid #262626";
    entry.style.padding = "4px 0";
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
};

window.clearLog = function () {
    const body = document.getElementById("ocr-log-body");
    if (body) body.innerHTML = "";
};

window.copyLog = function () {
    const body = document.getElementById("ocr-log-body");
    if (!body) return;
    navigator.clipboard.writeText(body.innerText).then(() => alert("Copied!"));
};

window.handleFileSelect = function (input) {
    window.createDebugWindow();
    if (!input.files || !input.files[0]) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = function () {
            runOCR(img, dataUrl);
        };
        img.src = dataUrl;
    };
    reader.readAsDataURL(input.files[0]);
};

function preprocessImage(imgElement) {
    const scale = 3.5;
    const w = imgElement.width;
    const h = imgElement.height;

    const sx = w * 0.50;
    const sy = h * 0.20;
    const sw = w * 0.45;
    const sh = h * 0.60;

    const canvas = document.createElement("canvas");
    canvas.width = sw * scale;
    canvas.height = sh * scale;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgElement, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const threshold = 110;

    for (let i = 0; i < data.length; i += 4) {
        let v = Math.max(data[i], data[i + 1], data[i + 2]);
        if (v < 50) v = 0;
        else v = Math.min(255, v * 1.5);
        const bin = v > threshold ? 0 : 255;
        data[i] = bin;
        data[i + 1] = bin;
        data[i + 2] = bin;
    }

    ctx.putImageData(imageData, 0, 0);

    const pArea = document.getElementById("ocr-preview-area");
    if (pArea) {
        pArea.innerHTML = "";
        const previewImg = document.createElement("img");
        previewImg.src = canvas.toDataURL();
        previewImg.style.height = "100%";
        previewImg.style.maxWidth = "100%";
        previewImg.style.objectFit = "contain";
        previewImg.style.border = "1px solid #f00";
        pArea.appendChild(previewImg);
    }

    return canvas.toDataURL("image/jpeg", 1.0);
}

function parseLegacyText(text) {
    const lines = String(text || "").split("\n").filter(line => line.trim().length > 0);
    let resIndex = -1;
    let mass = null;
    let resistance = null;
    let instability = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/O/g, "0").replace(/l/g, "1").replace(/I/g, "1").replace(/S/g, "5");
        if (line.includes("%") || line.match(/RES/i)) {
            const digits = line.match(/(\d+(?:\.\d+)?)/);
            if (digits) {
                resIndex = i;
                resistance = parseFloat(digits[0]);
                break;
            }
        }
    }

    if (resIndex !== -1) {
        if (resIndex > 0) {
            const prevLine = lines[resIndex - 1].replace(/O/g, "0").replace(/\s/g, "");
            const massMatch = prevLine.match(/(\d{4,})/);
            if (massMatch) mass = parseFloat(massMatch[0]);
        }

        if (resIndex < lines.length - 1) {
            const nextLine = lines[resIndex + 1].replace(/O/g, "0");
            const instMatch = nextLine.match(/(\d+\.\d+|\d+)/);
            if (instMatch) {
                let value = instMatch[0];
                if (value.split(".").length > 2) value = value.replace(".", "");
                instability = parseFloat(value);
            }
        }
    } else {
        lines.forEach(line => {
            const clean = line.replace(/O/g, "0").replace(/l/g, "1").replace(/S/g, "5");
            if (clean.match(/M[A4]SS/i)) {
                const m = clean.match(/(\d[\d\s]+)/);
                if (m) mass = parseFloat(m[0].replace(/\s/g, ""));
            }
            if (clean.match(/INST/i)) {
                const m = clean.match(/([\d.]+)/);
                if (m) instability = parseFloat(m[0]);
            }
        });
    }

    return {
        engine: "MFA Legacy Tesseract",
        valid: Number.isFinite(mass) && Number.isFinite(resistance) && Number.isFinite(instability),
        mass,
        resistance,
        instability,
        rawText: text
    };
}

async function runLegacyOCR(img) {
    if (typeof Tesseract === "undefined") {
        throw new Error("Tesseract.js is not available.");
    }

    const started = performance.now();
    const processedImg = preprocessImage(img);
    const worker = await Tesseract.createWorker("eng");

    try {
        await worker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:% "
        });
        const result = await worker.recognize(processedImg);
        const parsed = parseLegacyText(result.data.text);
        parsed.elapsedMs = Math.round(performance.now() - started);
        return parsed;
    } finally {
        await worker.terminate();
    }
}

function formatResult(result) {
    if (!result) return "NO RESULT";
    return [
        result.engine || "OCR",
        "valid=" + !!result.valid,
        "mass=" + (result.mass ?? "—"),
        "res=" + (result.resistance ?? "—"),
        "inst=" + (result.instability ?? "—"),
        result.elapsedMs != null ? "time=" + result.elapsedMs + "ms" : ""
    ].filter(Boolean).join(" · ");
}

function compareResults(primary, legacy) {
    if (!primary || !legacy) return;
    const fields = ["mass", "resistance", "instability"];
    const mismatches = fields.filter(field => {
        const a = Number(primary[field]);
        const b = Number(legacy[field]);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return true;
        const tolerance = field === "mass" ? 1 : 0.11;
        return Math.abs(a - b) > tolerance;
    });

    if (!mismatches.length) {
        log("COMPARE: Paddle and legacy agree on all core target fields.");
    } else {
        log("COMPARE: differences in " + mismatches.join(", ") + ". Paddle remains primary in ALPHA.");
    }
}

function applyResult(result, sourceLabel) {
    if (!result || !result.valid) return false;

    const fields = [];
    if (Number.isFinite(result.mass)) {
        document.getElementById("rockMass").value = result.mass;
        fields.push("mass");
    }
    if (Number.isFinite(result.resistance)) {
        document.getElementById("resistance").value = result.resistance;
        fields.push("resistance");
    }
    if (Number.isFinite(result.instability)) {
        document.getElementById("instability").value = result.instability;
        fields.push("instability");
    }

    if (!fields.length) return false;

    if (typeof window.calculate === "function") window.calculate();
    window.dispatchEvent(new CustomEvent("mfa:ocr-applied", {
        detail: {
            fields,
            engine: sourceLabel,
            result
        }
    }));

    log("SELECTED: " + sourceLabel);
    log("Simulation updated from OCR Target Acquisition values.");
    return true;
}

async function runOCR(img, originalDataUrl) {
    const load = document.getElementById("ocr-loading");
    if (load) load.classList.remove("hidden");

    let paddle = null;
    let legacy = null;

    try {
        log("PRIMARY: loading Regolith-compatible PaddleOCR...");
        if (!window.MFARegolithOCR || typeof window.MFARegolithOCR.scan !== "function") {
            throw new Error("MFARegolithOCR adapter is unavailable.");
        }

        try {
            paddle = await window.MFARegolithOCR.scan(originalDataUrl);
            log("PADDLE: " + formatResult(paddle));
            if (paddle.rockType) log("PADDLE ROCK TYPE: " + paddle.rockType);
            if (paddle.composition && paddle.composition.length) {
                log("PADDLE COMPOSITION: " + paddle.composition.map(x => x.name + " " + x.percent + "%").join(" | "));
            }
        } catch (error) {
            log("PADDLE ERROR: " + error.message);
        }

        // ALPHA shadow comparison: run legacy OCR even after a successful Paddle scan.
        try {
            log("SHADOW/FALLBACK: running MFA legacy Tesseract...");
            legacy = await runLegacyOCR(img);
            log("LEGACY: " + formatResult(legacy));
        } catch (error) {
            log("LEGACY ERROR: " + error.message);
        }

        compareResults(paddle, legacy);

        if (paddle && paddle.valid) {
            applyResult(paddle, "PADDLE OCR");
        } else if (legacy && legacy.valid) {
            log("PADDLE did not return a complete rock scan; using legacy fallback.");
            applyResult(legacy, "TESSERACT FALLBACK");
        } else {
            log("FAIL: neither OCR engine produced complete Mass / Resistance / Instability values.");
            if (paddle && paddle.rawText) log("PADDLE RAW: " + paddle.rawText.replace(/\n/g, " | "));
            if (legacy && legacy.rawText) log("LEGACY RAW: " + legacy.rawText.replace(/\n/g, " | "));
        }
    } finally {
        if (load) load.classList.add("hidden");
    }
}

window.MFAOCR = {
    runOCR,
    parseLegacyText,
    compareResults
};
