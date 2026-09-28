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

function cropScanPanel(imgElement) {
    // Approximate HUD geometry for 16:9, with scan-result labels on the right.
    // Keep a little padding for scaling variation, but exclude most ship/chat UI.
    const canvas = document.createElement("canvas");
    const w = imgElement.naturalWidth || imgElement.width;
    const h = imgElement.naturalHeight || imgElement.height;
    const sx = Math.floor(w * 0.825), sy = Math.floor(h * 0.345);
    const sw = Math.min(w - sx, Math.ceil(w * 0.17));
    const sh = Math.min(h - sy, Math.ceil(h * 0.20));
    canvas.width = Math.max(1, sw * 3);
    canvas.height = Math.max(1, sh * 3);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function preprocessImage(imgElement) {
    const canvas = cropScanPanel(imgElement);
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
        const value = Math.max(px[i], px[i+1], px[i+2]);
        // Preserve high-contrast HUD lettering against a white background.
        const bin = value > 120 ? 0 : 255;
        px[i] = px[i+1] = px[i+2] = bin;
    }
    ctx.putImageData(data, 0, 0);
    const pArea = document.getElementById("ocr-preview-area");
    if (pArea) {
        pArea.replaceChildren();
        const previewImg = document.createElement("img");
        previewImg.src = canvas.toDataURL();
        previewImg.style.cssText = "height:100%;max-width:100%;object-fit:contain;border:1px solid #f00";
        pArea.appendChild(previewImg);
    }
    return canvas.toDataURL("image/png");
}

function parseLegacyText(text) {
    // Parse only labels from the scan panel; never use free-floating percentages
    // or nearby numbers because module stats/composition can mimic target values.
    const normalized = String(text || "")
        .toUpperCase()
        .replace(/\r/g, "\n")
        .replace(/[,]/g, "");
    function match(label, suffix) {
        const m = normalized.match(new RegExp(label + "[\\s:.=-]{0,12}([0-9]+" + suffix + ")"));
        return m ? Number(m[1]) : null;
    }
    const mass = match("(?:MASS|NASS)", "(?:[.]?[0-9]*)");
    const resistance = match("(?:RESISTANCE|RESISTANC|RESIST)", "(?:[.][0-9]+)?");
    const instability = match("(?:INSTABILITY|INSTABILIT|INSTAB)", "(?:[.][0-9]+)?");
    const hasScanAnchor = /SCAN\s*RESULTS?/.test(normalized) ||
        (/MASS/.test(normalized) && /RESIST/.test(normalized) && /INSTAB/.test(normalized));
    return {
        engine: "MFA Legacy Tesseract",
        valid: hasScanAnchor && Number.isFinite(mass) && mass > 0 &&
            Number.isFinite(resistance) && resistance >= 0 && resistance <= 100 &&
            Number.isFinite(instability) && instability >= 0,
        mass,
        resistance,
        instability,
        rawText: text
    };
}

async function runLegacyOCR(img) {
    if (typeof Tesseract === "undefined") throw new Error("Tesseract.js is not available.");
    const started = performance.now();
    const processedImg = preprocessImage(img);
    const worker = await Tesseract.createWorker("eng");
    try {
        await worker.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:% ",
            preserve_interword_spaces: "1"
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

    // Alpha: require operator confirmation before changing ANY input field.
    const prompt = "OCR " + sourceLabel + " read:\n" +
        "Mass: " + result.mass + " kg\n" +
        "Resistance: " + result.resistance + "%\n" +
        "Instability: " + result.instability + "\n\n" +
        "Compare with the game HUD. Apply these values to MFA?";
    if (!window.confirm(prompt)) {
        log("REVIEW: OCR values not applied; operator declined confirmation.");
        return false;
    }

    const fields = ["mass", "resistance", "instability"];
    document.getElementById("rockMass").value = result.mass;
    document.getElementById("resistance").value = result.resistance;
    document.getElementById("instability").value = result.instability;

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
            paddle = await window.MFARegolithOCR.scan(cropScanPanel(img).toDataURL("image/png"));
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
