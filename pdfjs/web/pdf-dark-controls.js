// pdf-dark-controls.js
// Controla el modo del visor PDF.js desde un script externo.

(function () {
  function applyModeClass(mode) {
    const container = document.getElementById('viewerContainer');
    if (!container) return;
    container.classList.remove('dark-mode', 'sepia-mode', 'invert-mode', 'light-mode');
    switch (mode) {
      case 'dark':  container.classList.add('dark-mode'); break;
      case 'sepia': container.classList.add('sepia-mode'); break;
      case 'invert':container.classList.add('invert-mode'); break;
      default:      container.classList.add('light-mode');
    }
  }

  function saveMode(mode) {
    // Guarda la preferencia (si chrome.storage está disponible)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ pdfViewerMode: mode });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Añadir listeners a botones (si existen)
    document.getElementById('btn-light')?.addEventListener('click', function () { applyModeClass('light'); saveMode('light'); });
    document.getElementById('btn-dark')?.addEventListener('click',  function () { applyModeClass('dark');  saveMode('dark');  });
    document.getElementById('btn-sepia')?.addEventListener('click', function () { applyModeClass('sepia'); saveMode('sepia'); });
    document.getElementById('btn-invert')?.addEventListener('click', function () { applyModeClass('invert'); saveMode('invert'); });

    // Restaurar preferencia guardada
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ pdfViewerMode: 'dark' }, function (data) {
        applyModeClass(data.pdfViewerMode || 'dark');
      });
    } else {
      // fallback por defecto
      applyModeClass('dark');
    }
  });

  // Exponer una función para probar desde consola
  window.applyPdfMode = applyModeClass;
})();
