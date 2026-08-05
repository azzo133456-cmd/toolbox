// Shared helpers used across tool pages.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function copyText(text, btn) {
  const value = String(text ?? "");
  if (!value) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Copy command was rejected");
    }

    if (btn) {
      const originalLabel = btn.textContent;
      btn.textContent = "已複製";
      setTimeout(() => (btn.textContent = originalLabel), 1200);
    }
    return true;
  } catch (error) {
    console.error("Unable to copy text", error);
    return false;
  }
}

function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a chance to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function setStatus(el, msg, isError) {
  if (!el) return;
  el.textContent = msg;
  el.className = "status-msg " + (isError ? "error" : msg ? "ok" : "");
}

// Wires drag-and-drop onto `zoneEl`: dropped files are assigned to
// `fileInputEl.files` and a native "change" event is dispatched, so the
// existing file-input change handler runs just as if the user had picked
// the file(s) through the browser's file dialog.
function setupDropzone(zoneEl, fileInputEl) {
  if (!zoneEl || !fileInputEl) return;

  let dragDepth = 0;
  zoneEl.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth++;
    zoneEl.classList.add("dragover");
  });
  zoneEl.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  zoneEl.addEventListener("dragleave", () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) zoneEl.classList.remove("dragover");
  });
  zoneEl.addEventListener("dragend", () => {
    dragDepth = 0;
    zoneEl.classList.remove("dragover");
  });
  zoneEl.addEventListener("drop", (event) => {
    event.preventDefault();
    dragDepth = 0;
    zoneEl.classList.remove("dragover");
    if (!event.dataTransfer || !event.dataTransfer.files.length) return;

    try {
      fileInputEl.files = event.dataTransfer.files;
      fileInputEl.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (error) {
      console.error("Unable to assign dropped files", error);
    }
  });
}
