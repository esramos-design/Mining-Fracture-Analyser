/**
 * MFA Regolith-compatible PaddleOCR adapter (ALPHA)
 *
 * OCR engine: @gutenye/ocr-browser / PaddleOCR PP-OCRv4.
 * Rock text parsing is adapted from RegolithCo/RegolithCo-OCR (ISC License).
 * See THIRD_PARTY_NOTICES.md.
 *
 * This module only produces Target Acquisition values. It does not participate
 * in fracture mechanics, Fleet Planner state, or ideal recommendation logic.
 */
(function () {
    "use strict";

    const ENGINE_URL = "https://esm.sh/@gutenye/ocr-browser@1.4.8?bundle";
    const MODEL_BASE = "https://cdn.jsdelivr.net/npm/@gutenye/ocr-models@1.4.2/assets";
    const MODEL_URLS = {
        detectionPath: MODEL_BASE + "/ch_PP-OCRv4_det_infer.onnx",
        recognitionPath: MODEL_BASE + "/ch_PP-OCRv4_rec_infer.onnx",
        dictionaryPath: MODEL_BASE + "/ppocr_keys_v1.txt"
    };

    let ocrInstancePromise = null;

    function cleanLine(text) {
        return String(text || "").trim();
    }

    function round(value, places) {
        const m = Math.pow(10, places);
        return Math.round(value * m) / m;
    }

    function normalizePercent(value) {
        if (!Number.isFinite(value)) return null;
        // Regolith may expose fractional values (0.16) while MFA mechanics use 0–100.
        return round(value >= 0 && value <= 1 ? value * 100 : value, 2);
    }

    function parseRockText(ocrText) {
        const lines = String(ocrText || "")
            .split("\n")
            .map(cleanLine)
            .filter(Boolean);
        const upper = lines.map(line => line.toUpperCase());

        const anchors = {
            scan: upper.some(line => line.includes("SCAN RESULTS")),
            mass: upper.some(line => /\b(?:MASS|NASS)\b/.test(line)),
            resistance: upper.some(line => /(?:RESIST|RESISTANCE|RESISTANC|SISTAN)/.test(line)),
            instability: upper.some(line => /(?:INSTAB|INSTABILITY|INSTABILIT|ABIT|STAB)/.test(line)),
            composition: upper.some(line => /(?:COMPOSITION|COMP0SITI0N)/.test(line))
        };

        const anchorCount = Object.values(anchors).filter(Boolean).length;
        if (anchorCount < 3) {
            return {
                valid: false,
                anchorCount,
                mass: null,
                resistance: null,
                instability: null,
                rockType: null,
                composition: [],
                rawText: ocrText
            };
        }

        let mass = null;
        let resistance = null;
        let instability = null;
        let rockType = null;
        const composition = [];

        for (const line of lines) {
            if (mass === null) {
                const m = line.match(/(?:MASS|NASS)\s*[:=\s]\s*([\d,]+(?:\.\d+)?)/i);
                if (m) {
                    const value = Number(m[1].replace(/,/g, ""));
                    if (Number.isFinite(value)) mass = Math.round(value);
                }
            }

            if (instability === null) {
                const m = line.match(/(?:INSTAB|INSTABILITY|INSTABILIT|ABIT|STAB)[^\d]*([\d,.]+)/i);
                if (m) {
                    const value = Number(m[1].replace(/,/g, ""));
                    if (Number.isFinite(value)) instability = normalizePercent(value);
                }
            }

            if (resistance === null) {
                const m = line.match(/(?:RESIST|RESISTANCE|RESISTANC|SISTAN)[^\d]*([\d,.]+)/i);
                if (m) {
                    const value = Number(m[1].replace(/,/g, ""));
                    if (Number.isFinite(value)) resistance = normalizePercent(value);
                }
            }

            if (!rockType) {
                const type = line.match(/\b([MCSEIPQ])\s*[-_. ]?\s*TYPE\b/i);
                if (type) rockType = type[1].toUpperCase() + "-TYPE";
            }

            // Generic composition capture for display/debug only. It does not affect mechanics.
            const comp = line.match(/([A-Z][A-Z0-9 -]{2,})\s+([\d.]+)\s*%/i);
            if (comp) {
                const name = comp[1].trim().replace(/\s+/g, " ");
                const percent = Number(comp[2]);
                if (
                    Number.isFinite(percent) &&
                    !/(MASS|RESIST|INSTAB|SCAN RESULTS|COMPOSITION)/i.test(name)
                ) {
                    composition.push({ name, percent });
                }
            }
        }

        return {
            valid: mass !== null && resistance !== null && instability !== null,
            anchorCount,
            mass,
            resistance,
            instability,
            rockType,
            composition,
            rawText: ocrText
        };
    }

    async function getOcr() {
        if (!ocrInstancePromise) {
            ocrInstancePromise = import(ENGINE_URL)
                .then(async mod => {
                    const Ocr = mod.default || mod;
                    if (!Ocr || typeof Ocr.create !== "function") {
                        throw new Error("PaddleOCR browser module did not expose Ocr.create().");
                    }
                    return Ocr.create({ models: MODEL_URLS });
                })
                .catch(error => {
                    ocrInstancePromise = null;
                    throw error;
                });
        }
        return ocrInstancePromise;
    }

    async function recognize(imageDataUrl) {
        const ocr = await getOcr();
        const result = await ocr.detect(imageDataUrl);
        const lines = Array.isArray(result)
            ? result
            : (result && Array.isArray(result.texts) ? result.texts : []);
        return lines
            .map(item => typeof item === "string" ? item : item && item.text)
            .filter(Boolean)
            .join("\n");
    }

    async function scan(imageDataUrl) {
        const started = performance.now();
        const text = await recognize(imageDataUrl);
        const parsed = parseRockText(text);
        parsed.engine = "Regolith-compatible PaddleOCR";
        parsed.elapsedMs = Math.round(performance.now() - started);
        return parsed;
    }

    window.MFARegolithOCR = {
        scan,
        parseRockText,
        normalizePercent,
        engineUrl: ENGINE_URL,
        modelUrls: Object.assign({}, MODEL_URLS)
    };
})();
