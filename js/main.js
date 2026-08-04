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
