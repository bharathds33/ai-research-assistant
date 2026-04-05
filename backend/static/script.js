const queryInput = document.getElementById("queryInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const reportContainer = document.getElementById("reportContainer");
const statusBox = document.getElementById("statusBox");

const API_URL = "/analyze";

let latestTextReport = "";

function showStatus(message, type = "info") {
    statusBox.textContent = message;
    statusBox.className = `status ${type}`;
}

function hideStatus() {
    statusBox.textContent = "";
    statusBox.className = "status hidden";
}

function buildTextReport(data) {
    let lines = [];
    lines.push("WEB RESEARCH REPORT");
    lines.push("============================================================");
    lines.push(`TOPIC: ${data.query}`);
    lines.push("");
    lines.push("OVERVIEW");
    lines.push("------------------------------------------------------------");
    lines.push(data.overview);
    lines.push("");
    lines.push("KEY FINDINGS");
    lines.push("------------------------------------------------------------");

    data.findings.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.title}`);
        lines.push(`   Summary: ${item.summary}`);
        lines.push(`   Source: ${item.url}`);
        lines.push("");
    });

    lines.push("CONCLUSION");
    lines.push("------------------------------------------------------------");
    lines.push(data.conclusion);

    return lines.join("\n");
}

function renderReport(data) {
    const findingsHtml = data.findings.map((item, index) => `
        <div class="finding-card">
            <div class="finding-title">${index + 1}. ${item.title}</div>
            <div class="finding-summary">${item.summary}</div>
            <a class="finding-link" href="${item.url}" target="_blank">${item.url}</a>
        </div>
    `).join("");

    reportContainer.className = "report-content";
    reportContainer.innerHTML = `
        <div class="report-topic">${data.query}</div>

        <div class="report-section-title">Overview</div>
        <div class="report-text">${data.overview}</div>

        <div class="report-section-title">Key Findings</div>
        ${findingsHtml}

        <div class="report-section-title">Conclusion</div>
        <div class="report-text">${data.conclusion}</div>
    `;
}

analyzeBtn.addEventListener("click", async () => {
    const query = queryInput.value.trim();

    if (!query) {
        showStatus("Please enter a research topic before generating the report.", "error");
        return;
    }

    analyzeBtn.disabled = true;
    downloadBtn.disabled = true;
    hideStatus();

    reportContainer.className = "report-placeholder";
    reportContainer.textContent = "Generating report. Please wait...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (data.error) {
            reportContainer.className = "report-placeholder";
            reportContainer.textContent = "Failed to generate report.";
            showStatus(data.error, "error");
            latestTextReport = "";
            return;
        }

        renderReport(data);
        latestTextReport = buildTextReport(data);
        downloadBtn.disabled = false;
        showStatus("Report generated successfully.", "info");
    } catch (error) {
        reportContainer.className = "report-placeholder";
        reportContainer.textContent = "Unable to connect to backend.";
        showStatus("Backend connection failed. Make sure FastAPI is running.", "error");
        latestTextReport = "";
    } finally {
        analyzeBtn.disabled = false;
    }
});

clearBtn.addEventListener("click", () => {
    queryInput.value = "";
    reportContainer.className = "report-placeholder";
    reportContainer.textContent = "Your generated report will appear here.";
    downloadBtn.disabled = true;
    latestTextReport = "";
    hideStatus();
});

downloadBtn.addEventListener("click", () => {
    if (!latestTextReport) return;

    const blob = new Blob([latestTextReport], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "research_report.txt";
    anchor.click();

    window.URL.revokeObjectURL(url);
});