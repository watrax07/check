const SECTIONS = [
  { id: "carroceria", mount: "section-carroceria", title: "1. Carrocería", items: [
    "Golpe delantero", "Golpe trasero", "Parachoques", "Puertas", "Capó", "Maletera", "Vidrios / Parabrisas"
  ]},
  { id: "habitaculo", mount: "section-habitaculo", title: "2. Habitáculo", items: [
    "Asientos", "Controles del volante", "Radio / Multimedia", "Aire acondicionado", "Sunroof",
    "Luces interiores", "Limpia parabrisas", "Claxon", "Controles adicionales"
  ]},
  { id: "motor-superior", mount: "section-motor-superior", title: "3. Motor (parte superior / visual)", items: [
    "Fugas de aceite", "Fugas de refrigerante", "Mezcla aceite/refrigerante", "Estado del turbo", "Batería"
  ]},
  { id: "motor-inferior", mount: "section-motor-inferior", title: "4. Motor (parte inferior)", items: [
    "Fuga por cárter", "Fuga por caja de cambios", "Protecciones inferiores"
  ]},
  { id: "suspension", mount: "section-suspension", title: "5. Suspensión y Dirección", items: [
    "Amortiguadores delanteros", "Amortiguadores traseros", "Rótulas / Bujes", "Dirección"
  ]},
  { id: "llantas", mount: "section-llantas", title: "6. Llantas y Frenos", items: [
    "Llantas (estado general)", "Año de fabricación llantas", "Discos de freno", "Pastillas de freno"
  ]}
];

const PHOTO_SLOTS = [
  "Foto 1 (Vehículo)",
  "Foto 2 (Vehículo)",
  "Foto 3 (Vehículo)",
  "Foto 4 (Vehículo)",
  "Foto 5 (Escáner)"
];

const formState = {
  fields: {},
  checks: {},
  photos: Array(PHOTO_SLOTS.length).fill(null),
  logo: null,
};

function createTable(sectionId, items) {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:40%">Ítem</th>
        <th style="width:20%; text-align:center;">Estado</th>
        <th style="width:40%">Comentario</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  items.forEach((itemName, idx) => {
    const key = `${sectionId}-${idx}`;
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${itemName}</strong></td>
      <td>
        <div class="status">
          <div class="dot green" title="Bueno" data-key="${key}" data-value="green">🟢</div>
          <div class="dot yellow" title="Observación" data-key="${key}" data-value="yellow">🟡</div>
          <div class="dot red" title="Malo" data-key="${key}" data-value="red">🔴</div>
        </div>
      </td>
      <td>
        <input class="comment-input" type="text" placeholder="Comentario..." data-comment="${key}" />
      </td>
    `;

    tbody.appendChild(tr);
    formState.checks[key] = formState.checks[key] || { status: "green", comment: "" };
  });

  wrap.appendChild(table);
  return wrap;
}

function mountSections() {
  SECTIONS.forEach(sec => {
    const mount = document.getElementById(sec.mount);
    mount.innerHTML = "";
    mount.appendChild(createTable(sec.id, sec.items));
  });
}

function mountPhotos() {
  const grid = document.getElementById("photos");
  grid.innerHTML = "";

  PHOTO_SLOTS.forEach((label, i) => {
    const box = document.createElement("div");
    box.className = "photo-box";
    box.innerHTML = `
      <strong>${label}</strong>
      <input type="file" accept="image/*" data-photo-index="${i}" />
      <div class="preview" id="preview-${i}">
        <span class="muted">Sin foto</span>
      </div>
    `;
    grid.appendChild(box);
  });
}

function setDefaultDate() {
  const date = document.getElementById("fecha");
  if (!date.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    date.value = `${yyyy}-${mm}-${dd}`;
  }
}

function renderPhotoPreview(i) {
  const preview = document.getElementById(`preview-${i}`);
  preview.innerHTML = "";

  if (!formState.photos[i]) {
    preview.innerHTML = `<span class="muted">Sin foto</span>`;
    return;
  }

  const img = document.createElement("img");
  img.src = formState.photos[i];
  preview.appendChild(img);
}

/* =========================
   MAPA DEL VEHÍCULO
   ========================= */
let currentPaint = "green";

function setPaintColor(color) {
  currentPaint = color;
  document.querySelectorAll(".palette .p").forEach(b => b.classList.remove("active"));
  document.querySelector(`.palette .p[data-paint="${color}"]`)?.classList.add("active");
}

function paintZone(zoneEl) {
  const zoneId = zoneEl.dataset.zone;

  zoneEl.classList.remove("green", "yellow", "red");
  zoneEl.classList.add(currentPaint);

  formState.map[zoneId] = currentPaint;
}

/* =========================
   EVENTOS
   ========================= */
function bindEvents() {
  // Semáforo
  document.addEventListener("click", (e) => {
    // Selector color mapa
    const paintBtn = e.target.closest("[data-paint]");
    if (paintBtn) {
      setPaintColor(paintBtn.dataset.paint);
      return;
    }

    // pintar zona
    const zone = e.target.closest(".zone");
    if (zone) {
      paintZone(zone);
      return;
    }

    // semáforo de tabla
    const dot = e.target.closest(".dot");
    if (!dot) return;

    const key = dot.dataset.key;
    const value = dot.dataset.value;

    document.querySelectorAll(`.dot[data-key="${key}"]`).forEach(d => d.classList.remove("active"));
    dot.classList.add("active");

    formState.checks[key].status = value;
  });

  // Comentarios
  document.addEventListener("input", (e) => {
    const input = e.target.closest("input[data-comment]");
    if (input) {
      const key = input.dataset.comment;
      formState.checks[key].comment = input.value;
      return;
    }

    // campos principales
    const id = e.target.id;
    if (["placa", "modelo", "anio", "fecha", "conclusiones", "mapNotes"].includes(id)) {
      formState.fields[id] = e.target.value;
      if (id === "mapNotes") formState.mapNotes = e.target.value;
    }
  });

  // Fotos
  document.addEventListener("change", (e) => {
    const fileInput = e.target.closest('input[type="file"][data-photo-index]');
    if (!fileInput) return;

    const idx = Number(fileInput.dataset.photoIndex);
    const file = fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      formState.photos[idx] = reader.result;
      renderPhotoPreview(idx);
    };
    reader.readAsDataURL(file);
  });

  // Logo empresa
  document.getElementById("logoEmpresa").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      formState.logo = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // Botones
  document.getElementById("btnReset").addEventListener("click", resetForm);
  document.getElementById("btnPdf").addEventListener("click", finishAndDownloadPdf);
}

function resetForm() {
  if (!confirm("¿Seguro que quieres limpiar todo?")) return;
  window.location.reload();
}

/* =========================
   PDF BONITO
   ========================= */
/* =========================================================
   HELPERS PDF (NO ESTIRAR IMÁGENES + LOGO PROPORCIONAL)
   ========================================================= */

// Inserta imagen dentro de una "caja" sin deformar (contain)
function addImageContain(pdf, dataUrl, x, y, maxW, maxH, format = "JPEG") {
  const props = pdf.getImageProperties(dataUrl);
  const imgW = props.width;
  const imgH = props.height;

  const ratio = Math.min(maxW / imgW, maxH / imgH);
  const w = imgW * ratio;
  const h = imgH * ratio;

  const cx = x + (maxW - w) / 2;
  const cy = y + (maxH - h) / 2;

  pdf.addImage(dataUrl, format, cx, cy, w, h);
  return { w, h, cx, cy };
}

// Inserta logo proporcional sin deformarse
function addLogoProportional(pdf, imgData, x, y, maxW, maxH) {
  const props = pdf.getImageProperties(imgData);
  const ratio = Math.min(maxW / props.width, maxH / props.height);
  const w = props.width * ratio;
  const h = props.height * ratio;
  pdf.addImage(imgData, "PNG", x, y, w, h);
  return { w, h };
}


/* =========================================================
   PDF PREMIUM (LOGO FIJO + CARDS + TABLAS + FOTOS NÍTIDAS)
   ========================================================= */

async function finishAndDownloadPdf() {
  const btn = document.getElementById("btnPdf");
  const original = btn?.textContent || "Finalizar y Descargar PDF";
  if (btn) {
    btn.textContent = "Generando PDF...";
    btn.disabled = true;
  }

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;

    // Valores seguros
    const placa = document.getElementById("placa")?.value?.trim() || "SIN_PLACA";
    const modelo = document.getElementById("modelo")?.value?.trim() || "SIN_MODELO";
    const anio = document.getElementById("anio")?.value?.trim() || "SIN_AÑO";
    const fecha = document.getElementById("fecha")?.value || "SIN_FECHA";
    const conclusiones = document.getElementById("conclusiones")?.value?.trim() || "Sin conclusiones.";

    // Contadores resumen
    let greenCount = 0, yellowCount = 0, redCount = 0;
    Object.values(formState.checks || {}).forEach(c => {
      if (c.status === "green") greenCount++;
      if (c.status === "yellow") yellowCount++;
      if (c.status === "red") redCount++;
    });

    // Helpers internos
    const wrapText = (text, maxW) => pdf.splitTextToSize(text, maxW);

    function line(y) {
      pdf.setDrawColor(210);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageW - margin, y);
    }

    function drawCard(x, y, w, h) {
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(220);
      pdf.roundedRect(x, y, w, h, 4, 4, "FD");
    }

    function cardTitle(title, x, y) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(25);
      pdf.text(title, x, y);
      pdf.setTextColor(0);
    }

    function drawStatusBadge(status, x, y) {
      if (status === "green") pdf.setFillColor(34, 197, 94);
      if (status === "yellow") pdf.setFillColor(245, 158, 11);
      if (status === "red") pdf.setFillColor(239, 68, 68);

      // Cuadro color
      pdf.rect(x, y - 4, 6, 6, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      const label = status === "green" ? "BUENO" : status === "yellow" ? "OBSERVAR" : "MALO";
      pdf.setTextColor(0);
      pdf.text(label, x + 9, y);
    }

    /* =========================
       PORTADA PREMIUM
       ========================= */

    // Header con fondo
    pdf.setFillColor(245, 247, 250);
    pdf.roundedRect(margin, 10, pageW - margin * 2, 34, 4, 4, "F");

    // Logo fijo (proporcional, sin deformar)
    const fixedLogo = document.getElementById("fixedLogo");
    let logoW = 0;

    if (fixedLogo && fixedLogo.complete && fixedLogo.naturalWidth > 0) {
      const c = document.createElement("canvas");
      c.width = fixedLogo.naturalWidth;
      c.height = fixedLogo.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(fixedLogo, 0, 0);

      const logoData = c.toDataURL("image/png");
      const r = addLogoProportional(pdf, logoData, margin + 4, 14, 22, 22);
      logoW = r.w + 6;
    }

    // Título
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(10);
    pdf.text("CHECK AUTOS - INSPECCIÓN VEHICULAR", margin + 8 + logoW, 24);

    // Subtítulo
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80);
    pdf.text("Reporte de revisión vehicular", margin + 8 + logoW, 30);
    pdf.setTextColor(0);

    // Línea separador
    line(48);

    let y = 56;

    // Card Datos del vehículo
    drawCard(margin, y, pageW - margin * 2, 40);
    cardTitle("Datos del vehículo", margin + 6, y + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Placa: ${placa}`, margin + 6, y + 18);
    pdf.text(`Modelo: ${modelo}`, margin + 6, y + 25);
    pdf.text(`Año: ${anio}`, margin + 6, y + 32);
    pdf.text(`Fecha de Inspección: ${fecha}`, margin + 6, y + 39);

    y += 48;

    // Card Resumen general
    drawCard(margin, y, pageW - margin * 2, 34);
    cardTitle("Resumen general", margin + 6, y + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Bueno: ${greenCount}`, margin + 6, y + 20);
    pdf.text(`Observación: ${yellowCount}`, margin + 6, y + 27);
    pdf.text(`Malo: ${redCount}`, margin + 6, y + 34);

    y += 42;

    // Card Conclusión
    const conclusionLines = wrapText(conclusiones, pageW - margin * 2 - 12);
    const conclusionHeight = Math.min(70, 20 + conclusionLines.length * 5);

    drawCard(margin, y, pageW - margin * 2, conclusionHeight);
    cardTitle("Conclusión y recomendación", margin + 6, y + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(conclusionLines, margin + 6, y + 20);

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(130);
    pdf.text(`Generado automáticamente - ${new Date().toLocaleDateString("es-ES")}`, margin, pageH - 10);
    pdf.setTextColor(0);

    /* =========================
       DETALLE DE INSPECCIÓN
       ========================= */

    pdf.addPage();
    y = 16;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Detalle de inspección", margin, y);
    y += 6;
    line(y);
    y += 10;

    const rowH = 10;
    const colItem = 85;
    const colEstado = 36;
    const colComentario = pageW - margin * 2 - colItem - colEstado;

    function drawTableHeader() {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y, pageW - margin * 2, rowH, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0);

      pdf.text("Ítem", margin + 2, y + 7);
      pdf.text("Estado", margin + colItem + 2, y + 7);
      pdf.text("Comentario", margin + colItem + colEstado + 2, y + 7);

      y += rowH;
    }

    function drawRow(item, status, comment) {
      if (y > pageH - 20) {
        pdf.addPage();
        y = 16;
        drawTableHeader();
      }

      pdf.setDrawColor(220);
      pdf.rect(margin, y, colItem, rowH);
      pdf.rect(margin + colItem, y, colEstado, rowH);
      pdf.rect(margin + colItem + colEstado, y, colComentario, rowH);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(0);

      pdf.text(item, margin + 2, y + 6);

      drawStatusBadge(status, margin + colItem + 2, y + 6);

      const wrapped = pdf.splitTextToSize(comment || "-", colComentario - 4);
      pdf.text(wrapped.slice(0, 2), margin + colItem + colEstado + 2, y + 6);

      y += rowH;
    }

    // Render secciones
    SECTIONS.forEach(sec => {
      if (y > pageH - 35) {
        pdf.addPage();
        y = 16;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(sec.title || sec.id, margin, y);
      y += 6;

      drawTableHeader();

      sec.items.forEach((itemName, idx) => {
        const key = `${sec.id}-${idx}`;
        const data = formState.checks[key] || { status: "green", comment: "" };
        drawRow(itemName, data.status, data.comment);
      });

      y += 10;
    });

    /* =========================
       FOTOS (NÍTIDAS, SIN ESTIRAR)
       ========================= */

    const photos = (formState.photos || []).filter(Boolean);
    if (photos.length > 0) {
      pdf.addPage();
      y = 16;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Registro fotográfico", margin, y);
      y += 6;
      line(y);
      y += 10;

      const boxW = pageW - margin * 2;
      const boxH = 82;

      for (let i = 0; i < photos.length; i++) {
        if (y + boxH > pageH - 20) {
          pdf.addPage();
          y = 16;
        }

        // caja
        pdf.setDrawColor(220);
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(margin, y, boxW, boxH, 4, 4, "FD");

        // imagen contenida
        addImageContain(pdf, photos[i], margin + 2, y + 2, boxW - 4, boxH - 4, "JPEG");

        // etiqueta
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(60);
        pdf.text(`Foto ${i + 1}`, margin, y + boxH + 6);
        pdf.setTextColor(0);

        y += boxH + 14;
      }
    }

    // Guardar PDF
    pdf.save(`INSPECCION_${placa}_${fecha}.pdf`);

  } catch (err) {
    console.error(err);
    alert("Error generando PDF. Revisa consola (F12).");
  } finally {
    if (btn) {
      btn.textContent = original;
      btn.disabled = false;
    }
  }
}


/* =========================
   INIT
   ========================= */
function init() {
  mountSections();
  mountPhotos();
  bindEvents();
  setDefaultDate();

  // default verde seleccionado
  Object.keys(formState.checks).forEach(key => {
    const dot = document.querySelector(`.dot[data-key="${key}"][data-value="green"]`);
    dot?.classList.add("active");
  });

  // default color mapa
  setPaintColor("green");
}

document.addEventListener("DOMContentLoaded", init);
