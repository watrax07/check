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
async function finishAndDownloadPdf() {
  const btn = document.getElementById("btnPdf");
  const original = btn.textContent;

  btn.textContent = "Generando PDF...";
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;

    const placa = document.getElementById("placa").value?.trim() || "SIN_PLACA";
    const modelo = document.getElementById("modelo").value?.trim() || "SIN_MODELO";
    const anio = document.getElementById("anio").value?.trim() || "SIN_AÑO";
    const fecha = document.getElementById("fecha").value || "SIN_FECHA";
    const conclusiones = document.getElementById("conclusiones").value?.trim() || "Sin conclusiones.";

    const wrapText = (text, maxW) => pdf.splitTextToSize(text, maxW);

    function line(y) {
      pdf.setDrawColor(40);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
    }

    function drawStatusBadge(status, x, y) {
      // Cuadro de color + texto
      if (status === "green") pdf.setFillColor(34, 197, 94);
      if (status === "yellow") pdf.setFillColor(245, 158, 11);
      if (status === "red") pdf.setFillColor(239, 68, 68);

      pdf.rect(x, y - 4, 6, 6, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      const label = status === "green" ? "BUENO" : status === "yellow" ? "OBSERVAR" : "MALO";
      pdf.setTextColor(0);
      pdf.text(label, x + 9, y);
    }

    // ===== PORTADA =====
    // Logo
    if (formState.logo) {
      // intentamos PNG; si falla, cambia a "JPEG"
      pdf.addImage(formState.logo, "PNG", margin, 10, 26, 26);
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("CHECK AUTOS - INSPECCIÓN VEHICULAR", margin + (formState.logo ? 30 : 0), 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(70);
    pdf.text("Reporte de revisión vehicular", margin + (formState.logo ? 30 : 0), 28);
    pdf.setTextColor(0);

    line(33);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Datos del vehículo", margin, 44);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Placa: ${placa}`, margin, 52);
    pdf.text(`Modelo: ${modelo}`, margin, 59);
    pdf.text(`Año: ${anio}`, margin, 66);
    pdf.text(`Fecha de Inspección: ${fecha}`, margin, 73);

    line(80);

    // Resumen general
    let greenCount = 0, yellowCount = 0, redCount = 0;
    Object.values(formState.checks).forEach(c => {
      if (c.status === "green") greenCount++;
      if (c.status === "yellow") yellowCount++;
      if (c.status === "red") redCount++;
    });

    pdf.setFont("helvetica", "bold");
    pdf.text("Resumen general", margin, 92);

    pdf.setFont("helvetica", "normal");
    pdf.text(`Bueno: ${greenCount}`, margin, 100);
    pdf.text(`Observación: ${yellowCount}`, margin, 107);
    pdf.text(`Malo: ${redCount}`, margin, 114);

    line(122);

    pdf.setFont("helvetica", "bold");
    pdf.text("Conclusión y recomendación", margin, 132);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const conclusionLines = wrapText(conclusiones, pageW - margin * 2);
    pdf.text(conclusionLines, margin, 140);

    // Footer portada
    pdf.setFontSize(9);
    pdf.setTextColor(110);
    pdf.text(`Generado automáticamente - ${new Date().toLocaleDateString("es-ES")}`, margin, pageH - 12);
    pdf.setTextColor(0);

    // ===== DETALLE =====
    pdf.addPage();
    let y = 16;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Detalle de inspección", margin, y);
    y += 6;
    line(y);
    y += 8;

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

      // badge
      drawStatusBadge(status, margin + colItem + 2, y + 6);

      // comentario wrap (max 2 líneas)
      const wrapped = pdf.splitTextToSize(comment || "-", colComentario - 4);
      pdf.text(wrapped.slice(0, 2), margin + colItem + colEstado + 2, y + 6);

      y += rowH;
    }

    SECTIONS.forEach(sec => {
      if (y > pageH - 35) {
        pdf.addPage();
        y = 16;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(sec.title, margin, y);
      y += 6;

      drawTableHeader();

      sec.items.forEach((itemName, idx) => {
        const key = `${sec.id}-${idx}`;
        const data = formState.checks[key] || { status: "green", comment: "" };
        drawRow(itemName, data.status, data.comment);
      });

      y += 10;
    });

    // ===== FOTOS =====
    const photos = formState.photos.filter(Boolean);
    if (photos.length > 0) {
      pdf.addPage();
      y = 16;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Registro fotográfico", margin, y);
      y += 6;
      line(y);
      y += 10;

      const imgW = pageW - margin * 2;
      const imgH = 80;

      for (let i = 0; i < photos.length; i++) {
        if (y + imgH > pageH - 20) {
          pdf.addPage();
          y = 16;
        }

        pdf.setDrawColor(220);
        pdf.rect(margin, y, imgW, imgH);
        pdf.addImage(photos[i], "JPEG", margin + 2, y + 2, imgW - 4, imgH - 4);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`Foto ${i + 1}`, margin, y + imgH + 6);

        y += imgH + 14;
      }
    }

    // ===== MAPA DEL VEHÍCULO (CAPTURA BONITA) =====
    let currentPaint = "green";
formState.map = formState.map || {};

function setPaintColor(color) {
  currentPaint = color;
  document.querySelectorAll(".palette .p").forEach(b => b.classList.remove("active"));
  document.querySelector(`.palette .p[data-paint="${color}"]`)?.classList.add("active");
}

// Pintar SVG zone
function paintSvgZone(el) {
  const zoneId = el.dataset.zone;

  el.classList.remove("green", "yellow", "red");
  el.classList.add(currentPaint);

  formState.map[zoneId] = currentPaint;
}

document.addEventListener("click", (e) => {
  const paintBtn = e.target.closest("[data-paint]");
  if (paintBtn) {
    setPaintColor(paintBtn.dataset.paint);
    return;
  }

  const zone = e.target.closest("#carSvg .zone");
  if (zone) {
    paintSvgZone(zone);
    return;
  }
});


    pdf.save(`INSPECCION_${placa}_${fecha}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Error generando PDF. Revisa la consola (F12) y vuelve a intentar.");
  } finally {
    btn.textContent = original;
    btn.disabled = false;
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
