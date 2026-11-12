(function () {
    "use strict";

    const STORAGE_KEY = "mfa.oreQualityScout.sightings.v1";
    const MAX_FILE_BYTES = 20 * 1024 * 1024;
    const MAX_SIGHTINGS = 500;
    let pending = [];

    const byId = id => document.getElementById(id);
    const safeText = value => String(value ?? "");
    const scoreFromPercent = percent => Math.round(Number(percent) * 10);

    function readSightings() {
        try {
            const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(rows) ? rows.filter(row => row && Number.isFinite(Number(row.score))) : [];
        } catch (_) {
            return [];
        }
    }

    function writeSightings(rows) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, MAX_SIGHTINGS)));
            renderSightings();
            return true;
        } catch (_) {
            setStatus("Could not save: browser storage is full or unavailable. Export or clear some sightings.", true);
            return false;
        }
    }

    function setStatus(message, isError = false) {
        const status = byId("scoutProgress");
        status.textContent = message;
        status.classList.remove("hidden", "scout-error");
        if (isError) status.classList.add("scout-error");
    }

    function hideStatus() {
        byId("scoutProgress").classList.add("hidden");
    }

    function createImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("The selected file could not be opened as an image."));
            img.src = dataUrl;
        });
    }

    function imageDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Could not read the selected image."));
            reader.readAsDataURL(file);
        });
    }

    function normalizeCandidates(parsed) {
        const seen = new Set();
        return (parsed.composition || []).map(item => {
            const name = safeText(item.name).trim().replace(/\s+/g, " ");
            const percent = Number(item.percent);
            const key = name.toLowerCase();
            if (!name || !Number.isFinite(percent) || percent < 0 || percent > 100 || seen.has(key)) return null;
            seen.add(key);
            return { name, percent: Math.round(percent * 100) / 100 };
        }).filter(Boolean);
    }

    function renderPending(candidates, location) {
        pending = candidates;
        const host = byId("scoutReview");
        host.replaceChildren();
        host.classList.remove("hidden");

        const title = document.createElement("h3");
        title.textContent = candidates.length ? "Review OCR readings" : "No composition readings found";
        host.append(title);

        const explainer = document.createElement("p");
        explainer.textContent = candidates.length
            ? "Check the mineral names and percentages against the game screen. Each reading stays marked unverified until you confirm it."
            : "The OCR did not find a labelled composition percentage in the scan panel. Try a full scan screenshot, or enter a reading manually.";
        host.append(explainer);

        if (!candidates.length) return;

        const table = document.createElement("div");
        table.className = "scout-candidate-list";
        candidates.forEach((candidate, index) => {
            const row = document.createElement("div");
            row.className = "scout-candidate-row";
            const label = document.createElement("label");
            label.className = "scout-candidate-check";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.dataset.candidate = String(index);
            const text = document.createElement("span");
            text.textContent = `${candidate.name} · ${candidate.percent.toFixed(2)}% · ${scoreFromPercent(candidate.percent)}/1000`;
            label.append(checkbox, text);
            row.append(label);
            table.append(row);
        });
        host.append(table);

        const save = document.createElement("button");
        save.type = "button";
        save.className = "primary-action scout-save-button";
        save.textContent = "SAVE SELECTED AS UNVERIFIED";
        save.addEventListener("click", () => {
            const selected = Array.from(host.querySelectorAll("[data-candidate]:checked"))
                .map(input => pending[Number(input.dataset.candidate)])
                .filter(Boolean);
            if (!selected.length) {
                setStatus("Select at least one reading to save.", true);
                return;
            }
            const sightings = selected.map(candidate => makeSighting(candidate.name, candidate.percent, location, "OCR · unverified"));
            const saved = writeSightings([...sightings, ...readSightings()]);
            if (saved) {
                setStatus(`${sightings.length} reading${sightings.length === 1 ? "" : "s"} saved locally as unverified.`);
                host.classList.add("hidden");
                byId("scoutFile").value = "";
            }
        });
        host.append(save);
    }

    function makeSighting(ore, percent, location, source) {
        return {
            id: (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
            ore: safeText(ore).trim().slice(0, 60),
            percent: Math.round(Number(percent) * 100) / 100,
            score: scoreFromPercent(percent),
            location: safeText(location).trim().slice(0, 100),
            source,
            confirmed: source === "Manual · confirmed",
            createdAt: new Date().toISOString()
        };
    }

    async function scanFile(file) {
        if (!file) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
            setStatus("Choose a PNG, JPG or WebP screenshot.", true);
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setStatus("The image is larger than 20 MB. Choose a smaller screenshot.", true);
            return;
        }
        if (!window.MFARegolithOCR || !window.MFAOCR?.cropScanPanel) {
            setStatus("MFA OCR is not ready. Reload the page and try again.", true);
            return;
        }

        byId("scoutReview").classList.add("hidden");
        setStatus("Reading the scan panel locally… first use may take a little longer.");
        try {
            const image = await createImage(await imageDataUrl(file));
            const crop = window.MFAOCR.cropScanPanel(image);
            const parsed = await window.MFARegolithOCR.scan(crop.toDataURL("image/png"));
            const candidates = normalizeCandidates(parsed);
            renderPending(candidates, byId("scoutLocation").value);
            setStatus(candidates.length
                ? `Found ${candidates.length} possible composition reading${candidates.length === 1 ? "" : "s"}. Verify before relying on them.`
                : "OCR completed, but no composition percentage was read.", !candidates.length);
        } catch (error) {
            setStatus(`OCR failed: ${error.message || "unknown error"}`, true);
        }
    }

    function escapeCsv(value) {
        return `"${safeText(value).replace(/"/g, '""')}"`;
    }

    function renderSightings() {
        const all = readSightings();
        const min = Math.max(0, Math.min(1000, Number(byId("minimumScore").value) || 0));
        const query = byId("oreFilter").value.trim().toLowerCase();
        const filtered = all
            .filter(item => Number(item.score) >= min && (!query || safeText(item.ore).toLowerCase().includes(query)))
            .sort((a, b) => Number(b.score) - Number(a.score) || String(b.createdAt).localeCompare(String(a.createdAt)));

        byId("scoutCount").textContent = `${all.length} SAVED`;
        byId("scoutEmpty").classList.toggle("hidden", filtered.length > 0);
        byId("scoutEmpty").textContent = all.length
            ? "No sightings match these filters. Lower the minimum score or clear the ore search."
            : "No saved sightings yet. Scan an image or enter a reading to start your local notebook.";

        const list = byId("sightingList");
        list.replaceChildren();
        filtered.forEach(item => {
            const card = document.createElement("article");
            card.className = "sighting-card";
            const head = document.createElement("div");
            head.className = "sighting-card-head";
            const title = document.createElement("strong");
            title.textContent = safeText(item.ore) || "Unknown ore";
            const score = document.createElement("span");
            score.className = "sighting-score";
            score.textContent = `${Number(item.score)}/1000`;
            head.append(title, score);
            const meta = document.createElement("p");
            const date = new Date(item.createdAt);
            const dateText = Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
            meta.textContent = `${Number(item.percent).toFixed(2)}% composition · ${item.location || "Location not recorded"} · ${dateText}`;
            const state = document.createElement("span");
            state.className = item.confirmed ? "sighting-state confirmed" : "sighting-state";
            state.textContent = item.confirmed ? "CONFIRMED BY PILOT" : "UNVERIFIED · CHECK HUD";
            const actions = document.createElement("div");
            actions.className = "sighting-actions";
            if (!item.confirmed) {
                const confirm = document.createElement("button");
                confirm.type = "button";
                confirm.className = "ops-button secondary";
                confirm.textContent = "Confirm";
                confirm.addEventListener("click", () => updateSighting(item.id, row => ({ ...row, confirmed: true, source: "Pilot-confirmed OCR" })));
                actions.append(confirm);
            }
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "ops-button secondary";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => writeSightings(readSightings().filter(row => row.id !== item.id)));
            actions.append(remove);
            card.append(head, meta, state, actions);
            list.append(card);
        });
    }

    function updateSighting(id, transform) {
        writeSightings(readSightings().map(item => item.id === id ? transform(item) : item));
    }

    function addManual(event) {
        event.preventDefault();
        const ore = byId("manualOre").value.trim();
        const percent = Number(byId("manualPercent").value);
        if (!ore || !Number.isFinite(percent) || percent < 0 || percent > 100) {
            setStatus("Enter an ore name and composition from 0 to 100 percent.", true);
            return;
        }
        const item = makeSighting(ore, percent, byId("scoutLocation").value, "Manual · confirmed");
        if (writeSightings([item, ...readSightings()])) {
            event.target.reset();
            setStatus(`${ore} saved locally at ${item.score}/1000.`);
        }
    }

    function exportCsv() {
        const rows = readSightings();
        if (!rows.length) {
            setStatus("There are no sightings to export.", true);
            return;
        }
        const output = ["ore,composition_percent,derived_score,location,confirmed,source,created_at"];
        rows.forEach(item => output.push([
            item.ore, item.percent, item.score, item.location, item.confirmed ? "yes" : "no", item.source, item.createdAt
        ].map(escapeCsv).join(",")));
        const blob = new Blob([output.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mfa-ore-sightings-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function initTheme() {
        const allowed = ["day", "dusk", "night"];
        const saved = localStorage.getItem("mfa.theme") || "day";
        document.documentElement.dataset.theme = allowed.includes(saved) ? saved : "day";
        document.querySelectorAll("[data-scout-theme]").forEach(button => {
            button.addEventListener("click", () => {
                const theme = button.dataset.scoutTheme;
                if (!allowed.includes(theme)) return;
                document.documentElement.dataset.theme = theme;
                localStorage.setItem("mfa.theme", theme);
            });
        });
    }

    byId("scoutFile").addEventListener("change", event => scanFile(event.target.files?.[0]));
    byId("manualSightingForm").addEventListener("submit", addManual);
    byId("minimumScore").addEventListener("input", renderSightings);
    byId("oreFilter").addEventListener("input", renderSightings);
    byId("exportSightings").addEventListener("click", exportCsv);
    byId("clearSightings").addEventListener("click", () => {
        if (!readSightings().length) return;
        if (window.confirm("Clear all Ore Quality Scout sightings stored in this browser?")) writeSightings([]);
    });
    initTheme();
    renderSightings();
})();
