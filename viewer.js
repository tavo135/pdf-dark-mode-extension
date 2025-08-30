import { getDocument, GlobalWorkerOptions } from "./pdfjs/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdfjs/build/pdf.worker.mjs");

const viewer = document.getElementById("viewer");
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.5;

// Canvas único para render
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
viewer.appendChild(canvas);

// Función para renderizar páginas
function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      pageRendering = false;
      document.getElementById("pageNum").textContent = num;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

function queueRenderPage(num) {
  if (pageRendering) pageNumPending = num;
  else renderPage(num);
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

// Modo oscuro con icono flotante
document.getElementById("darkModeIcon").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Abrir PDF local con input
document.getElementById("filePicker").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);
    getDocument({ data: typedarray }).promise.then((pdf) => {
      pdfDoc = pdf;
      viewer.innerHTML = "";
      viewer.appendChild(canvas);
      document.getElementById("pageCount").textContent = pdf.numPages;
      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
});

// Cargar PDF desde parámetro ?file= si se pasa en la URL
const params = new URLSearchParams(window.location.search);
const url = params.get("file");
if (url) {
  getDocument(url).promise.then((pdf) => {
    pdfDoc = pdf;
    document.getElementById("pageCount").textContent = pdf.numPages;
    renderPage(pageNum);
  });
}
