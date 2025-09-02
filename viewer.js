import * as pdfjsLib from "./pdfjs/build/pdf.mjs";

// Worker adaptable (extensión o pruebas locales)
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdfjs/build/pdf.worker.mjs");
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/build/pdf.worker.mjs";
}

const filePicker = document.getElementById("filePicker");
const viewer = document.getElementById("viewer");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumSpan = document.getElementById("pageNum");
const pageCountSpan = document.getElementById("pageCount");
const darkModeIcon = document.getElementById("darkModeIcon");

let currentPdf = null;
let currentPage = 1;
const SCALE = 1.2;

darkModeIcon.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

async function renderPage(num) {
  const page = await currentPdf.getPage(num);
  const viewport = page.getViewport({ scale: SCALE });

  // Limpiar
  viewer.innerHTML = "";

  // contenedor de la página
  const pageContainer = document.createElement("div");
  pageContainer.className = "page-container";
  pageContainer.style.width = `${viewport.width}px`;
  pageContainer.style.height = `${viewport.height}px`;
  viewer.appendChild(pageContainer);

  // canvas
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  pageContainer.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Renderizar en canvas
  await page.render({ canvasContext: ctx, viewport }).promise;

  // Crear capa de texto manual
  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  textLayerDiv.style.width = `${viewport.width}px`;
  textLayerDiv.style.height = `${viewport.height}px`;
  pageContainer.appendChild(textLayerDiv);

  const textContent = await page.getTextContent();

  for (const item of textContent.items) {
    const span = document.createElement("span");
    span.textContent = item.str;
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    span.style.pointerEvents = "auto";
    span.style.userSelect = "text";
    span.style.webkitUserSelect = "text";
    span.style.color = "transparent";
    span.style.webkitTextFillColor = "transparent";

    // Transform: combinar la transform del viewport con la del texto
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const scaleY = Math.hypot(tx[2], tx[3]);
    if (scaleY === 0) {
      textLayerDiv.appendChild(span);
      continue;
    }

    // Aplicar la posición y el tamaño de la fuente.
    span.style.left = `${tx[4]}px`;
    span.style.top = `${tx[5]}px`;
    span.style.fontSize = `${scaleY}px`;
    // Normalizamos la matriz para que no vuelva a escalar verticalmente.
    span.style.transform = `matrix(${tx[0] / scaleY}, ${tx[1] / scaleY}, ${tx[2] / scaleY}, ${tx[3] / scaleY}, 0, 0)`;
    span.style.transformOrigin = "0% 0%";

    textLayerDiv.appendChild(span);
  }

  pageNumSpan.textContent = num;
}

// navegación
prevPageBtn.addEventListener("click", () => {
  if (currentPdf && currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});
nextPageBtn.addEventListener("click", () => {
  if (currentPdf && currentPage < currentPdf.numPages) {
    currentPage++;
    renderPage(currentPage);
  }
});

// cargar PDF
filePicker.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const typedArray = new Uint8Array(ev.target.result);
    currentPdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    pageCountSpan.textContent = currentPdf.numPages;
    currentPage = 1;
    renderPage(currentPage);
  };
  reader.readAsArrayBuffer(file);
});
