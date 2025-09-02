// Detectar si el documento actual es un PDF
if (window.location.href.endsWith(".pdf")) {
  console.log("[PDF Dark Mode] Detectado PDF:", window.location.href);

  // Redirigir al visor personalizado con el PDF cargado como parámetro
  const viewerUrl = chrome.runtime.getURL("viewer.html") + "?file=" + encodeURIComponent(window.location.href);

  // Reemplaza la pestaña actual con tu visor
  window.location.replace(viewerUrl);
}
