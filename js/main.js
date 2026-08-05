// Shared helpers used across tool pages
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "已複製!";
      setTimeout(() => (btn.textContent = orig), 1200);
    }
  });
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
  URL.revokeObjectURL(url);
}

function setStatus(el, msg, isError) {
  el.textContent = msg;
  el.className = "status-msg " + (isError ? "error" : msg ? "ok" : "");
}

// Wires drag-and-drop onto `zoneEl`: dropped files are assigned to
// `fileInputEl.files` and a native "change" event is dispatched, so the
// existing file-input change handler runs exactly as if the user had picked
// the file(s) through the browser's file dialog.
function setupDropzone(zoneEl, fileInputEl) {
  ["dragenter", "dragover"].forEach((evt) =>
    zoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      zoneEl.classList.add("dragover");
    })
  );
  ["dragleave", "dragend"].forEach((evt) =>
    zoneEl.addEventListener(evt, () => zoneEl.classList.remove("dragover"))
  );
  zoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    zoneEl.classList.remove("dragover");
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    fileInputEl.files = e.dataTransfer.files;
    fileInputEl.dispatchEvent(new Event("change"));
  });
}
