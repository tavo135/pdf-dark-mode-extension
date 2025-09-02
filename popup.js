document.getElementById("injectBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inyectamos script en la pestaña actual
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectViewer
  });
});

function injectViewer() {
  console.log("🚀 Activando visor personalizado...");

  // Borra el visor actual
  document.documentElement.innerHTML = "";

  // Crea un iframe con tu viewer.html
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("viewer.html") + "?file=" + encodeURIComponent(window.location.href);
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  document.documentElement.appendChild(iframe);
}
