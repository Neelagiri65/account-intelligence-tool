const fileInput = document.getElementById("file-input");
const fileCount = document.getElementById("file-count");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const riskScore = document.getElementById("risk-score");
const bankVerdict = document.getElementById("bank-verdict");
const verdictReason = document.getElementById("verdict-reason");
const actionPlan = document.getElementById("action-plan");
const userNotes = document.getElementById("user-notes");

const state = {
  files: [],
};

const updatePreview = () => {
  preview.innerHTML = "";
  if (state.files.length === 0) {
    fileCount.textContent = "No files selected";
    return;
  }

  fileCount.textContent = `${state.files.length} file(s) selected`;
  state.files.forEach((file) => {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.innerHTML = `<span>${file.name}</span><span>${Math.round(
      file.size / 1024
    )} KB</span>`;
    preview.appendChild(item);
  });
};

fileInput.addEventListener("change", (event) => {
  state.files = Array.from(event.target.files || []);
  updatePreview();
  statusEl.textContent = state.files.length
    ? "Ready to analyze."
    : "Waiting for documents.";
});

const mockResponse = () => {
  const score = Math.floor(Math.random() * 5) + 4;
  return {
    score,
    verdict: score >= 7 ? "Yellow: Needs Review" : "Green: Low Risk",
    reason:
      "Titan detected a prior case entry that is disposed but still within the appeal window. EC is current to this month.",
    actionPlan:
      "Hi, could you please share the Appeal Non-Filing Certificate and latest EC (up to current date)?\n\nவணக்கம், மேல்முறையீடு தாக்கல் செய்யவில்லை என்பதற்கான சான்றிதழும் தற்போதைய EC-யும் (இன்றைய தேதி வரை) பகிரவும்.",
  };
};

const buildPayload = async () => {
  const formData = new FormData();
  state.files.forEach((file) => formData.append("files", file));
  formData.append("notes", userNotes.value.trim());
  return formData;
};

analyzeBtn.addEventListener("click", async () => {
  if (state.files.length === 0) {
    statusEl.textContent = "Please add at least one file.";
    return;
  }

  analyzeBtn.disabled = true;
  statusEl.textContent = "Analyzing documents...";

  try {
    const payload = await buildPayload();

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: payload,
    });

    if (!response.ok) {
      throw new Error("API not configured");
    }

    const data = await response.json();
    riskScore.textContent = `${data.score}/10`;
    bankVerdict.textContent = data.verdict;
    verdictReason.textContent = data.reason;
    actionPlan.value = data.actionPlan;
    statusEl.textContent = "Analysis complete.";
  } catch (error) {
    const data = mockResponse();
    riskScore.textContent = `${data.score}/10`;
    bankVerdict.textContent = data.verdict;
    verdictReason.textContent =
      data.reason + " (Demo mode — connect your backend for live results.)";
    actionPlan.value = data.actionPlan;
    statusEl.textContent = "Demo results shown (backend not connected).";
  } finally {
    analyzeBtn.disabled = false;
  }
});

updatePreview();
