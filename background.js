// background.js — Service Worker MV3
// Detecta cuando navegas a un .pdf y redirige a nuestro visor interno con filtros.

// Obtiene la URL base de la extensión (ej.: chrome-extension://<id>/)
const EXT_BASE = chrome.runtime.getURL(""); // "" devuelve la raíz de la extensión

// Devuelve true si la URL corresponde a nuestro visor interno
function isOurViewer(url) {
  // Comprobamos si la URL comienza con la base + nombre del archivo viewer.html
  return url.startsWith(chrome.runtime.getURL("viewer.html"));
}

// Devuelve true si la URL apunta a un PDF (heurística simple por extensión)
function isPdfUrl(url) {
  // Coincide con .pdf al final de la ruta o antes de query/hash, insensible a mayúsculas
  return /\.pdf($|[?#])/i.test(url);
}

// Evento que se dispara cuando una navegación queda confirmada en una pestaña
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Ignoramos subframes; actuamos solo en el frame principal
  if (details.url.endsWith(":pdf")){
    chrome.tabs.update(details.tabId, {
    url:chrome.runtime.getURL("pdfs/web/viewer.html") +"?file=" + encodeURIComponent(details.url)
  } );
}
});
  // Tomamos la URL real de la navegación
  const { tabId, url } = details;

  // Evitamos bucles: si ya estamos en nuestro viewer, no hacemos nada
  if (isOurViewer(url)) return;

  // Si la URL parece ser un PDF
  if (isPdfUrl(url)) {
    try {
      // Construimos la URL a nuestro visor, pasando la URL del PDF como query param "file"
      const viewerUrl = `${chrome.runtime.getURL("viewer.html")}?file=${encodeURIComponent(url)}`;

      // Redirigimos la pestaña actual a nuestro visor
      await chrome.tabs.update(tabId, { url: viewerUrl });
    } catch (err) {
      // Si algo falla, lo reportamos en consola de la extensión
      console.error("[PDF Dark Mode] Error redirigiendo al visor:", err);
    }
  }
});

// Sugerencia al usuario tras instalar (ej.: habilitar acceso a file://)
chrome.runtime.onInstalled.addListener(() => {
  console.log("[PDF Dark Mode] Instalado. Para PDFs locales, activa 'Allow access to file URLs' en chrome://extensions.");
});
