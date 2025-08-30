// Este script detecta si la pestaña actual es un PDF
// y redirige al visor PDF de la extensión (viewer.html).

if (window.location.href.endsWith(".pdf")) {
  const pdfUrl = window.location.href; // URL del PDF original
  const viewerUrl = chrome.runtime.getURL("viewer.html") + "?file=" + encodeURIComponent(pdfUrl);

  // Redirige al visor propio
  window.location.replace(viewerUrl);
}
