/**
 * MODULE: OPTICAL SCANNER & OCR (V35 - DYNAMIC CHANNEL MAXIMIZER)
 * Version: 5.35 (STABLE)
 * Improvements:
 * - Dynamic Channel: Uses Math.max(R,G,B) to detect Red, White, or Green text.
 * - Contrast Stretch: Crushes dark greys (rocks) to white while keeping bright text black.
 * - Anchor Logic: Uses "%" anchor system for data extraction.
 */

// --- 1. DEPENDENCY CHECK ---
(function loadTesseract() {
    if (typeof Tesseract !== 'undefined') return;
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    document.head.appendChild(script);
})();

// --- 2. UI UTILS ---
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;
    handle.style.cursor = 'move';
    function dragMouseDown(e) {
        e = e || window.event;
        if (e.target.tagName === 'BUTTON') return;
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

// --- 3. DEBUG WINDOW ---
window.createDebugWindow = function() {
    if (document.getElementById('ocr-debug-console')) {
        document.getElementById('ocr-debug-console').style.display = 'flex';
        return;
    }
    const logWin = document.createElement('div');
    logWin.id = 'ocr-debug-console';
    logWin.style.cssText = "position:fixed; bottom:20px; right:20px; width:450px; height:500px; background:rgba(13, 13, 13, 0.98); color:#F2F2F2; font-family:'JetBrains Mono', monospace; font-size:11px; padding:0; z-index:99999; border:1px solid #404040; border-radius:8px; display:flex; flex-direction:column; box-shadow: 0 10px 40px rgba(0,0,0,0.5);";
    
    logWin.innerHTML = `
        <div id="ocr-drag-header" style="background:linear-gradient(90deg, #404040, #0D0D0D); padding:10px; border-bottom:1px solid #404040; display:flex; justify-content:space-between; align-items:center; user-select:none; cursor:move; border-radius: 8px 8px 0 0;">
            <span style="font-weight:bold; color:#fff; letter-spacing:1px;">OCR INTELLIGENCE V35</span>
            <div style="display:flex; gap:5px;">
                <button onclick="window.copyLog()" style="cursor:pointer; background:#262626; color:#fff; border:1px solid #737373; padding:2px 8px; border-radius:4px; font-size:10px;">COPY</button>
                <button onclick="window.clearLog()" style="cursor:pointer; background:#262626; color:#fff; border:1px solid #737373; padding:2px 8px; border-radius:4px; font-size:10px;">CLR</button>
                <button onclick="document.getElementById('ocr-debug-console').style.display='none'" style="cursor:pointer; background:#522; color:#fff; border:1px solid #a33; padding:2px 8px; border-radius:4px; font-size:10px;">X</button>
            </div>
        </div>
        <div id="ocr-log-body" style="flex-grow:1; overflow-y:auto; padding:10px; user-select:text;"></div>
        <div id="ocr-preview-area" style="height:150px; border-top:1px solid #404040; background:#000; display:flex; justify-content:center; align-items:center; padding:5px;">
            <span style="color:#555">[PREVIEW]</span>
        </div>
    `;
    document.body.appendChild(logWin);
    makeDraggable(logWin, document.getElementById('ocr-drag-header'));
}

window.log = function(msg) {
    if (!document.getElementById('ocr-debug-console')) window.createDebugWindow();
    const box = document.getElementById('ocr-log-body');
    const entry = document.createElement('div');
    entry.style.borderBottom = "1px solid #262626";
    entry.style.padding = "4px 0";
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
}
window.clearLog = function() { document.getElementById('ocr-log-body').innerHTML = ""; }
window.copyLog = function() { navigator.clipboard.writeText(document.getElementById('ocr-log-body').innerText).then(()=>alert("Copied!")); }

// --- 4. FILE HANDLING ---
window.handleFileSelect = function(input) {
    window.createDebugWindow();
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() { runOCR(img); };
            img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// --- 5. IMAGE PROCESSING (DYNAMIC MAX-CHANNEL) ---
function preprocessImage(imgElement) {
    const scale = 3.5; 
    const w = imgElement.width;
    const h = imgElement.height;
    
    // Crop Right Side (Scanning Area)
    const sx = w * 0.50; 
    const sy = h * 0.20; 
    const sw = w * 0.45; 
    const sh = h * 0.60;

    const canvas = document.createElement('canvas');
    canvas.width = sw * scale;
    canvas.height = sh * scale;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imgElement, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Threshold for deciding between Background and Text
    const threshold = 110; 

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // DYNAMIC CHANNEL SELECTION
        // Pick strongest color (Red, Green, or Blue/White)
        let v = Math.max(r, g, b);

        // CONTRAST STRETCH
        if (v < 50) v = 0;
        else v = Math.min(255, v * 1.5); 

        // INVERT FOR TESSERACT
        const bin = v > threshold ? 0 : 255; 
        
        data[i] = bin; 
        data[i+1] = bin; 
        data[i+2] = bin; 
    }
    
    ctx.putImageData(imageData, 0, 0);

    const pArea = document.getElementById('ocr-preview-area');
    if(pArea) {
        pArea.innerHTML = '';
        const previewImg = document.createElement('img');
        previewImg.src = canvas.toDataURL();
        previewImg.style.height = '100%';
        previewImg.style.border = '1px solid #f00';
        pArea.appendChild(previewImg);
    }

    return canvas.toDataURL('image/jpeg', 1.0);
}

// --- 6. EXECUTION ---
async function runOCR(img) {
    const load = document.getElementById('ocr-loading');
    if(load) load.classList.remove('hidden');
    
    try {
        log("Processing (Dynamic Channels)...");
        const processedImg = preprocessImage(img);
        
        const worker = await Tesseract.createWorker('eng');
        await worker.setParameters({
            // Whitelist digits, dots, percent, and letters for context
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:% ' 
        });

        log("Reading...");
        const { data: { text } } = await worker.recognize(processedImg);
        await worker.terminate();
        
        parseData(text);

    } catch (e) {
        log("ERROR: " + e.message);
    } finally {
        if(load) load.classList.add('hidden');
    }
}

// --- 7. PARSING (ANCHOR METHOD) ---
function parseData(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    log("--- ANALYZING LINES ---");
    
    let resIndex = -1;
    let foundMass = null;
    let foundRes = null;
    let foundInst = null;

    // 1. FIND ANCHOR (RESISTANCE %)
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].replace(/O/g,'0').replace(/l/g,'1').replace(/I/g,'1').replace(/S/g,'5');
        
        // Look for '%' or "RESIST"
        if (line.includes('%') || line.match(/RES/i)) {
            const digits = line.match(/(\d+)/);
            if (digits) {
                resIndex = i;
                foundRes = parseFloat(digits[0]);
                log(`[${i}] ANCHOR FOUND (Resistance): ${foundRes}%`);
                break; 
            }
        }
    }

    // 2. RELATIVE LOOKUP
    if (resIndex !== -1) {
        // Look ABOVE for Mass (usually 1 line up)
        if (resIndex > 0) {
            let prevLine = lines[resIndex - 1].replace(/O/g,'0').replace(/\s/g,'');
            const massMatch = prevLine.match(/(\d{4,})/); // Mass is usually 4+ digits
            if (massMatch) {
                foundMass = parseFloat(massMatch[0]);
                log(`[${resIndex-1}] MASS CANDIDATE: ${foundMass}`);
            }
        }

        // Look BELOW for Instability (usually 1 line down)
        if (resIndex < lines.length - 1) {
            let nextLine = lines[resIndex + 1].replace(/O/g,'0');
            const instMatch = nextLine.match(/(\d+\.\d+|\d+)/); 
            if (instMatch) {
                let valStr = instMatch[0];
                if (valStr.split('.').length > 2) valStr = valStr.replace('.',''); 
                foundInst = parseFloat(valStr);
                log(`[${resIndex+1}] INSTABILITY CANDIDATE: ${foundInst}`);
            }
        }
    } else {
        // Fallback: Fuzzy Search
        log("Anchor failed. Trying fuzzy keyword search...");
        lines.forEach(line => {
            let clean = line.replace(/O/g,'0').replace(/l/g,'1').replace(/S/g,'5');
            if (clean.match(/M[A4]SS/i)) {
                let m = clean.match(/(\d[\d\s]+)/);
                if(m) foundMass = parseFloat(m[0].replace(/\s/g,''));
            }
            if (clean.match(/INST/i)) {
                let m = clean.match(/([\d\.]+)/);
                if(m) foundInst = parseFloat(m[0]);
            }
        });
    }

    // 3. APPLY VALUES
    let updated = false;
    if (foundMass) { 
        document.getElementById('rockMass').value = foundMass; 
        updated = true; 
    }
    if (foundRes !== null) { 
        document.getElementById('resistance').value = foundRes; 
        updated = true; 
    }
    if (foundInst !== null && !isNaN(foundInst)) { 
        document.getElementById('instability').value = foundInst; 
        updated = true; 
    }

    if (updated) {
        window.calculate();
        log("SUCCESS: Simulation Updated.");
    } else {
        log("FAIL: Could not extract data structure.");
        log("RAW DUMP FOR DEBUG: " + text.replace(/\n/g, " | "));
    }
}