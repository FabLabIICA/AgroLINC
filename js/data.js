
/* =========================================
   DEBUG MODE
========================================= */

const DEBUG = true;
const diplomaTotal = 7;

function debugLog(title, data) {
  if (!DEBUG) return;
  console.group(title);
  console.log(data);
  if (Array.isArray(data)) console.table(data);
  console.groupEnd();
}

/* =========================================
   CSV PARSER
========================================= */

function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row =>
      row.split(",").map(value =>
        value.replace(/^"|"$/g, "").trim()
      )
    );
}

/* =========================================
   NORMALIZER
========================================= */

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

function getCourseIcon(courseName) {
  const name = String(courseName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const iconRules = [
    { keywords: ["drone", "vant", "vuelo", "vehiculo aereo"], icon: "fa-helicopter-symbol" },
    { keywords: ["basico"], icon: "fa-cube" },
    { keywords: ["intermedio"], icon: "fa-cubes" },
    { keywords: ["laser", "corte"], icon: "fa-explosion" },
    { keywords: ["cnc"], icon: "fa-bore-hole" },
    { keywords: ["geoespacial", "mapa", "gps", "kobo", "territorio"], icon: "fa-map-location-dot" },
    { keywords: ["microcontrolador", "arduino"], icon: "fa-microchip" },
    { keywords: ["sensor", "actuador"], icon: "fa-tower-broadcast" },
    { keywords: ["electronico", "electricidad"], icon: "fa-bolt" },
    { keywords: ["iot", "internet de las cosas"], icon: "fa-wifi" },
    { keywords: ["automatizacion", "robot"], icon: "fa-robot" },
    { keywords: ["programacion"], icon: "fa-code" },
    { keywords: ["fabricacion digital"], icon: "fa-gear" },
    { keywords: ["innovacion", "canvas", "modelo", "soluciones"], icon: "fa-lightbulb" }
  ];

  for (const rule of iconRules) {
    if (rule.keywords.some(keyword => name.includes(keyword))) {
      return rule.icon;
    }
  }

  return "fa-graduation-cap";
}

/* =========================================
   URLS
========================================= */

const CURSOS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=1008621981&single=true&output=csv";

const ESTUDIANTES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=1841377808&single=true&output=csv";

const EVENTOS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=1458346686&single=true&output=csv";

const KPI_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=1244953961&single=true&output=csv";

const CALENDARIO_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=933585437&single=true&output=csv";

/* =========================================
   BLOG
========================================= */

const BLOG_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=670892286&single=true&output=csv";

const BLOG_IMAGENES_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQen9jQ8hTfq8nTuYdXS3JXnha10XGyrK42n57v2UT8kEvN3UlrfGiXcKaLY2ZhX8YN2IjWyiUqj-_q/pub?gid=2108075240&single=true&output=csv";

async function fetchBlog() {
  const noticiasRows = await fetchCSV(BLOG_URL, "BLOG");
  const imagenesRows = await fetchCSV(BLOG_IMAGENES_URL, "BLOG_IMAGENES");

  const imagenes = imagenesRows.slice(1).map(r => ({
    noticia: clean(r[1]),
    imagen: clean(r[0])
  }));

  return noticiasRows.slice(1).map(r => {
    const id = clean(r[0]);

    return {
      id,
      fecha: clean(r[1]),
      titulo: clean(r[2]),
      texto: clean(r[3]),
      imagenes: imagenes
        .filter(i => i.noticia === id)
        .map(i => `assets/images/blog/${i.imagen}`)
    };
  });
}

/* =========================================
   FETCH CSV
========================================= */

async function fetchCSV(url, name) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const text = await res.text();
    debugLog(`CSV RAW → ${name}`, text);

    const rows = parseCSV(text);
    debugLog(`CSV PARSED → ${name}`, rows);

    return rows;
  } catch (error) {
    console.error(`ERROR FETCH ${name}`, error);
    return [];
  }
}

/* =========================================
   FETCHERS
========================================= */

async function fetchKPI() {
  const res = await fetch(KPI_URL);
  if (!res.ok) throw new Error("Error cargando KPI");

  const text = await res.text();
  const rows = parseCSV(text);

  return rows.slice(1).map(r => {
    const nombreOriginal = String(r[0] || "")
      .replace(/\r/g, "")
      .replace(/\n/g, " ")
      .trim();

    return {
      nombre: nombreOriginal,
      valor: clean(r[1])
    };
  });
}

async function fetchCursos() {
  const rows = await fetchCSV(CURSOS_URL, "CURSOS");

  const data = rows.slice(1).map(r => ({
    id: clean(r[0]),
    nombre: r[1],
    descripcion: r[2],
    ruta: clean(r[3]),
    requisito1: clean(r[4]),
    requisito2: clean(r[5]),
    cursoFinal: clean(r[6]),
    etapa: r[7]
  })).filter(c => c.id && c.nombre);

  debugLog("CURSOS LIMPIOS", data);
  return data;
}

async function fetchCalendario() {
  const rows = await fetchCSV(CALENDARIO_URL, "CALENDARIO");

  return rows.slice(1).map(r => ({
    fecha: r[0],
    id: clean(r[1]),
    min: Number(r[3]),
    max: Number(r[4]),
    inscritos: Number(r[5]),
    enlace: r[6],
    espera: Number(r[7]),
    cancelados: Number(r[8])
  }));
}

async function fetchEstudiantes() {
  const rows = await fetchCSV(ESTUDIANTES_URL, "ESTUDIANTES");

  const data = rows.slice(1).map(r => ({
    cedula: clean(r[0]),
    nombre: r[1],
    correo: r[2],
    ruta: clean(r[3])
  }));

  debugLog("ESTUDIANTES LIMPIOS", data);
  return data;
}

async function fetchEventos() {
  const rows = await fetchCSV(EVENTOS_URL, "EVENTOS");

  const data = rows.slice(1).map(r => ({
    cedula: clean(r[0]),
    idCurso: clean(r[1]),
    fecha: r[2],
    estado: clean(r[3])
  }));

  debugLog("EVENTOS LIMPIOS", data);
  return data;
}

/* =========================================
   VARIABLES GLOBALES
========================================= */

let estudianteGlobal = null;
let cursosRutaGlobal = [];
let tuplasGlobales = [];

/* =========================================
   CONSULTA DE RUTA
========================================= */

async function consultarRuta() {
  const input = document.getElementById("cedulaInput");
  const cedula = clean(input?.value);

  if (!cedula) {
    alert("Ingrese una identificación");
    return;
  }

  const loader = document.getElementById("searchLoader");
  if (loader) loader.style.display = "block";

  try {
    const [estudiantes, cursos, eventos] = await Promise.all([
      fetchEstudiantes(),
      fetchCursos(),
      fetchEventos()
    ]);

    const estudiante = estudiantes.find(e => e.cedula === cedula);

    debugLog("ESTUDIANTE ENCONTRADO", estudiante);

    if (!estudiante) {
      estudianteGlobal = null;
      cursosRutaGlobal = [];
      tuplasGlobales = [];

      alert("No se encontró el participante");
      return;
    }

    estudianteGlobal = estudiante;

    /* PERFIL */

    document.getElementById("studentName").textContent =
      estudiante.nombre || "Participante";

    document.getElementById("studentRoute").textContent =
      `Ruta ${estudiante.ruta}`;

    const iniciales = (estudiante.nombre || "AG")
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    document.getElementById("profileAvatar").textContent = iniciales;

    /* EVENTOS COMPLETADOS */

    const eventosCompletados = eventos.filter(ev =>
      ev.cedula === cedula &&
      ev.estado.includes("complet")
    );

    // Evita repetir un mismo curso si hay varias filas del evento.
    const eventosUnicos = new Map();

    eventosCompletados.forEach(ev => {
      if (ev.idCurso && !eventosUnicos.has(ev.idCurso)) {
        eventosUnicos.set(ev.idCurso, [ev.idCurso, ev.fecha]);
      }
    });

    tuplasGlobales = Array.from(eventosUnicos.values());

    /* CURSOS DE LA RUTA */

    const cursosUnicos = new Map();

    cursos
      .filter(c => c.ruta === estudiante.ruta)
      .forEach(curso => {
        if (!cursosUnicos.has(curso.id)) {
          cursosUnicos.set(curso.id, curso);
        }
      });

    const cursosRuta = Array.from(cursosUnicos.values())
      .sort((a, b) => Number(a.etapa) - Number(b.etapa));

    cursosRutaGlobal = cursosRuta;

    /* PROGRESO */

    const completados = cursosRuta.filter(curso =>
      tuplasGlobales.some(t => t[0] === curso.id)
    ).length;

    const porcentaje = Math.min(
      100,
      (completados / diplomaTotal) * 100
    );

    document.getElementById("progressText").textContent =
      `${completados}/${diplomaTotal}`;

    document.getElementById("progressFill").style.width =
      `${porcentaje}%`;

    /* GRID DE CURSOS */

    const grid = document.getElementById("coursesGrid");
    grid.innerHTML = "";

    let disponibles = 0;

    cursosRuta.forEach(curso => {
      let estadoClase = "locked";
      let estadoTexto = "Bloqueado";
      let fechaTextoHTML = "";

      const tuplaCurso = tuplasGlobales.find(
        tupla => tupla[0] === curso.id
      );

      const completado = !!tuplaCurso;

      if (completado) {
        estadoClase = "completed";
        estadoTexto = "Completado";

        fechaTextoHTML = `
          <div class="course-date">
            Completado el: ${tuplaCurso[1] || "Fecha no registrada"}
          </div>
        `;
      } else {
        let disponible = false;

        const r1 = curso.requisito1;
        const r2 = curso.requisito2;

        const esFinal = clean(curso.cursoFinal)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (!r1 && !r2 && esFinal !== "si") {
          disponible = true;
        }

        if (
          r1 &&
          !r2 &&
          tuplasGlobales.some(t => t[0] === r1)
        ) {
          disponible = true;
        }

        if (
          r1 &&
          r2 &&
          tuplasGlobales.some(t => t[0] === r1) &&
          tuplasGlobales.some(t => t[0] === r2)
        ) {
          disponible = true;
        }

        if (esFinal === "si" && completados >= 6) {
          disponible = true;
        }

        if (disponible) {
          estadoClase = "available";
          estadoTexto = "Disponible";
          disponibles++;
        }
      }

      const card = document.createElement("div");
      card.className = `course-card ${estadoClase}`;

      card.innerHTML = `
        <div class="course-top">
          <i class="fa-solid ${getCourseIcon(curso.nombre)} course-card-icon"></i>
          <span class="course-status ${estadoClase}">
            ${estadoTexto}
          </span>
        </div>

        <h4>${curso.nombre}</h4>

        <span class="course-stage"
          style="display:block; margin-top:5px; font-size:0.8rem; opacity:0.7;">
          Etapa ${curso.etapa}
        </span>

        ${fechaTextoHTML}
      `;

      card.addEventListener("click", () => {
        abrirModalDetallado(curso, estadoClase);
      });

      grid.appendChild(card);
    });

    document.getElementById("completedCount").textContent =
      completados;

    document.getElementById("availableCount").textContent =
      disponibles;

    inyectarBotonCompartir();

  } catch (error) {
    console.error("ERROR GENERAL", error);
    alert("Error cargando datos");
  } finally {
    if (loader) loader.style.display = "none";
  }
}

/* =========================================
   MODAL DE DETALLES
========================================= */

async function abrirModalDetallado(curso, estado) {
  const modal = document.getElementById("courseModal");
  if (!modal) return;

  document.getElementById("modalStage").innerText =
    `Etapa ${curso.etapa || "General"}`;

  document.getElementById("modalTitle").innerText =
    curso.nombre;

  const container = document.getElementById("modalDescription");
  container.innerHTML = "";

  if (estado === "available") {
    const calendario = await fetchCalendario();
    const eventosCurso = calendario.filter(e => e.id === curso.id);

    let eventosHTML = "";

    if (eventosCurso.length === 0) {
      eventosHTML = `
        <div class="course-event event-closed">
          <div class="event-status status-closed">Próximamente</div>
          <p>No hay convocatorias publicadas para este curso.</p>
        </div>
      `;
    } else {
      eventosCurso.forEach(evento => {
        const cuposDisponibles =
          evento.max - evento.inscritos - evento.espera + evento.cancelados;

        const cumpleMinimo =
          evento.inscritos + evento.espera - evento.cancelados >= evento.min;

        let clase = "";
        let estadoClase = "";
        let estadoTexto = "";
        let detalle = "";
        let boton = "";

        if (!evento.enlace) {
          clase = "event-closed";
          estadoClase = "status-closed";
          estadoTexto = "Grupo cerrado";
          detalle = "Esta convocatoria se gestiona mediante un grupo específico.";
        } else if (cuposDisponibles <= 0) {
          clase = "event-waiting";
          estadoClase = "status-waiting";
          estadoTexto = "Lista de espera";
          detalle = `
            <br>
            <span class="event-note">
              No hay cupos disponibles. Puede registrarse en la lista de espera.
            </span>
          `;
          boton = `
            <a class="event-btn" href="${evento.enlace}"
              target="_blank" rel="noopener noreferrer">
              Unirse a lista de espera
            </a>
          `;
        } else if (cumpleMinimo) {
          clase = "event-confirmed";
          estadoClase = "status-confirmed";
          estadoTexto = "Convocatoria confirmada";
          detalle = `
            <div class="event-slots status-confirmed">
              ${cuposDisponibles} cupos disponibles
            </div>
          `;
          boton = `
            <a class="event-btn" href="${evento.enlace}"
              target="_blank" rel="noopener noreferrer">
              Solicitar inscripción
            </a>
          `;
        } else {
          clase = "event-pending";
          estadoClase = "status-pending";
          estadoTexto = "Convocatoria abierta";
          detalle = `
            <div class="event-note status-pending">
              Pendiente de alcanzar el cupo mínimo.
            </div>
            <div class="event-slots status-pending">
              ${cuposDisponibles} cupos disponibles
            </div>
          `;
          boton = `
            <a class="event-btn" href="${evento.enlace}"
              target="_blank" rel="noopener noreferrer">
              Solicitar inscripción
            </a>
          `;
        }

        eventosHTML += `
          <div class="course-event ${clase}">
            <div class="event-date">${evento.fecha}</div>
            <div class="event-status ${estadoClase}">
              ${estadoTexto}
            </div>
            ${detalle}
            ${boton}
          </div>
        `;
      });
    }

    container.innerHTML = `
      <p>${curso.descripcion || "Próximamente disponible."}</p>
      <div class="modal-events">
        <h4>Próximas convocatorias</h4>
        ${eventosHTML}
      </div>
    `;

  } else if (estado === "completed") {
    container.innerHTML = `
      <p>
        <strong>
          ¡Felicitaciones! Has completado y aprobado con éxito este módulo.
        </strong>
      </p>

      <p>${curso.descripcion || ""}</p>

      <h4 style="margin-top:1.2rem;">
        <i class="fa-solid fa-map"></i>
        Mapa de Contenidos Desarrollados:
      </h4>

      <img
        src="assets/images/rutas/default-contenido.jpg"
        alt="Contenidos AgroLINC"
        class="modal-image-content"
        onerror="this.src='https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80'"
      >
    `;

  } else if (estado === "locked") {
    let htmlRequisitos = "";

    [curso.requisito1, curso.requisito2].forEach(reqId => {
      if (!reqId || reqId === "-") return;

      const reqCurso = cursosRutaGlobal.find(c => c.id === reqId);
      if (!reqCurso) return;

      const esAprobado = tuplasGlobales.some(t => t[0] === reqCurso.id);

      let reqEstadoTexto = "Bloqueado";
      let reqEstadoClase = "locked";
      let reqIcono = "fa-lock";

      if (esAprobado) {
        reqEstadoTexto = "Completo";
        reqEstadoClase = "completed";
        reqIcono = "fa-circle-check";
      } else {
        let reqDisponible = false;

        const r1 = reqCurso.requisito1;
        const r2 = reqCurso.requisito2;

        const esFinalReq = clean(reqCurso.cursoFinal)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (!r1 && !r2 && esFinalReq !== "si") {
          reqDisponible = true;
        }

        if (r1 && !r2 && tuplasGlobales.some(t => t[0] === r1)) {
          reqDisponible = true;
        }

        if (
          r1 && r2 &&
          tuplasGlobales.some(t => t[0] === r1) &&
          tuplasGlobales.some(t => t[0] === r2)
        ) {
          reqDisponible = true;
        }

        if (reqDisponible) {
          reqEstadoTexto = "Disponible";
          reqEstadoClase = "available";
          reqIcono = "fa-unlock";
        }
      }

      htmlRequisitos += `
        <div class="req-item-link"
          onclick="cambiarFocoModal('${reqCurso.id}')"
          role="button"
          title="Haga clic para evaluar este curso">

          <div class="req-text-container">
            <i class="fa-solid ${getCourseIcon(reqCurso.nombre)}"></i>
            <span>${reqCurso.nombre}</span>
          </div>

          <span class="req-status-badge req-badge ${reqEstadoClase}">
            <i class="fa-solid ${reqIcono}"
              style="font-size:0.7rem; margin-right:2px;"></i>
            ${reqEstadoTexto}
          </span>
        </div>
      `;
    });

    let aclaracionFinal = "";

    const esFinal = clean(curso.cursoFinal)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (esFinal === "si") {
      const totalLleva = tuplasGlobales.length;
      const faltan = Math.max(0, 6 - totalLleva);

      aclaracionFinal = `
        <div class="modal-requirement-box"
          style="border-left:5px solid #eab308; background:#fef08a; color:#713f12; margin-top:10px;">

          <strong>Módulo Final de Graduación</strong>

          <p>
            Este bloque requiere la aprobación de un mínimo de 6 módulos
            en la plataforma. Actualmente registras
            <strong>${totalLleva} aprobados</strong>
            (Faltan: ${faltan}).
          </p>
        </div>
      `;
    }

    container.innerHTML = `
      <p>
        ${curso.descripcion || "Módulo bloqueado estructuralmente en tu ruta formativa."}
      </p>

      <div class="modal-requirement-box">
        <h4>
          <i class="fa-solid fa-triangle-exclamation"></i>
          Requisitos Obligatorios:
        </h4>

        <p>
          Debes aprobar los módulos predecesores.
          Presiona cualquiera para evaluar sus especificaciones:
        </p>

        ${htmlRequisitos}
      </div>

      ${aclaracionFinal}
    `;
  }

  modal.classList.add("active");
}

/* =========================================
   CAMBIAR FOCO DEL MODAL
========================================= */

function cambiarFocoModal(cursoId) {
  const curso = cursosRutaGlobal.find(c => c.id === cursoId);
  if (!curso) return;

  const esAprobado = tuplasGlobales.some(t => t[0] === curso.id);
  let estado = "locked";

  if (esAprobado) {
    estado = "completed";
  } else {
    const r1 = curso.requisito1;
    const r2 = curso.requisito2;

    const esFinal = clean(curso.cursoFinal)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let disponible = false;

    if (!r1 && !r2 && esFinal !== "si") {
      disponible = true;
    }

    if (r1 && !r2 && tuplasGlobales.some(t => t[0] === r1)) {
      disponible = true;
    }

    if (
      r1 && r2 &&
      tuplasGlobales.some(t => t[0] === r1) &&
      tuplasGlobales.some(t => t[0] === r2)
    ) {
      disponible = true;
    }

    if (esFinal === "si" && tuplasGlobales.length >= 6) {
      disponible = true;
    }

    if (disponible) estado = "available";
  }

  abrirModalDetallado(curso, estado);
}

/* =========================================
   BOTÓN DE TARJETA COMPARTIBLE
========================================= */

function inyectarBotonCompartir() {
  const profileCard = document.querySelector(".profile-card");

  if (!profileCard || document.getElementById("btnDownloadShare")) {
    return;
  }

  const btnShare = document.createElement("button");

  btnShare.id = "btnDownloadShare";
  btnShare.className = "download-share-btn";
  btnShare.innerHTML = `
    <i class="fa-solid fa-cloud-download-alt"></i>
    Descargar Tarjeta de Progreso
  `;

  btnShare.addEventListener("click", generarImagenRedesSociales);
  profileCard.appendChild(btnShare);
}

/* =========================================
   NOMBRES CORTOS DE CURSOS
========================================= */

function obtenerNombreCortoCurso(courseName) {
  const name = String(courseName || "").trim().toLowerCase();

  if (name.includes("impresion 3d") || name.includes("impresión 3d")) {
    return name.includes("intermedio") ? "Impresión 3D II" : "Impresión 3D I";
  }

  if (name.includes("drone") || name.includes("vant") || name.includes("vuelo")) {
    return "Vuelo de Drones";
  }

  if (name.includes("programación") || name.includes("programacion") || name.includes("programar")) {
    return "Programación";
  }

  if (name.includes("corte laser") || name.includes("corte láser")) {
    return "Corte Láser";
  }

  if (name.includes("cnc") || name.includes("router")) {
    return "Fresado CNC";
  }

  if (name.includes("iot") || name.includes("internet de las cosas")) {
    return "IoT";
  }

  if (name.includes("microcontrolador")) {
    return "Microcontroladores";
  }

  if (name.includes("actuadores") || name.includes("sensores")) {
    return "Sensores";
  }

  if (name.includes("automatizacion") || name.includes("automatización") || name.includes("robot")) {
    return "Automatización";
  }

  if (name.includes("geoespacial") || name.includes("mapa") || name.includes("kobo")) {
    return "Geotecnologías";
  }

  if (name.includes("innovacion") || name.includes("innovación") || name.includes("canvas")) {
    return "Innovación Aplicada";
  }

  if (name.includes("fabricacion digital") || name.includes("fabricación digital")) {
    return "Fabricación Digital";
  }

  if (name.includes("electricidad") || name.includes("electrotecnia")) {
    return "Electrónica";
  }

  return courseName.length > 22
    ? courseName.substring(0, 20) + "..."
    : courseName;
}

/* =========================================
   GENERAR TARJETA DE PROGRESO
========================================= */

function generarImagenRedesSociales() {
  if (!estudianteGlobal) return;

  if (typeof html2canvas !== "function") {
    alert("No se pudo cargar el generador de imágenes.");
    return;
  }

  let shareContainer = document.getElementById("linkedinShareCard");

  if (!shareContainer) {
    shareContainer = document.createElement("div");
    shareContainer.id = "linkedinShareCard";
    document.body.appendChild(shareContainer);
  }

  const aprobadosReales = cursosRutaGlobal.filter(c =>
    tuplasGlobales.some(t => t[0] === c.id)
  );

  const totalCursosLogrados = aprobadosReales.length;
  const tieneModuloFinal = aprobadosReales.some(c =>
    clean(c.nombre).includes("innovación") ||
    clean(c.nombre).includes("innovacion")
  );

  const esUnaHilera = totalCursosLogrados <= 6;
  const slotsOrdinariosVisibles = esUnaHilera
    ? 6
    : Math.max(totalCursosLogrados, 12);

  const columnasGrid = esUnaHilera
    ? 6
    : Math.ceil(slotsOrdinariosVisibles / 2);

  let medallasHTML = "";

  for (let i = 0; i < slotsOrdinariosVisibles; i++) {
    if (i < totalCursosLogrados) {
      const curso = aprobadosReales[i];
      const nombreAbreviado = obtenerNombreCortoCurso(curso.nombre);

      const tuplaCorrespondiente = tuplasGlobales.find(
        t => t[0] === curso.id
      );

      const fechaCursoFormateada =
        tuplaCorrespondiente?.[1] || "Completado";

      medallasHTML += `
        <div class="compact-medal-slot medal-unlocked"
          title="${curso.nombre}">

          <div class="compact-medal-circle">
            <i class="fa-solid ${getCourseIcon(curso.nombre)}"></i>
          </div>

          <span class="medal-course-title">
            ${nombreAbreviado}
          </span>

          <span class="medal-course-date">
            ${fechaCursoFormateada}
          </span>
        </div>
      `;
    } else {
      medallasHTML += `
        <div class="compact-medal-slot medal-locked">
          <div class="compact-medal-circle">
            <i class="fa-solid fa-lock"></i>
          </div>
        </div>
      `;
    }
  }

  const trofeoHTML = `
    <div class="special-trophy-panel ${tieneModuloFinal ? "trophy-unlocked" : "trophy-locked"}">
      <div class="trophy-title">Programa AgroLINC</div>

      <div class="trophy-badge">
        <i class="fa-solid ${tieneModuloFinal ? "fa-trophy" : "fa-award"}"></i>
      </div>

      <div class="trophy-title">
        ${tieneModuloFinal ? "COMPLETADO" : ""}
      </div>
    </div>
  `;

  const urlPlataforma =
    "https://fablabiica.github.io/AgroLINC/ruta.html";

  const qrApiUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(urlPlataforma)}&color=041124`;

  let fontSizeNombre = "2.6rem";

  if (estudianteGlobal.nombre && estudianteGlobal.nombre.length > 25) {
    fontSizeNombre = "2rem";
  }

  shareContainer.innerHTML = `
    <div class="share-branding-strip">
      <div class="share-strip-left">
        <img src="assets/images/agrolinc.svg"
          alt="AgroLINC" class="share-logo-main"
          onerror="this.style.display='none'">
      </div>

      <div class="share-strip-right">
        <img src="assets/images/micitt.png"
          alt="MICITT" class="share-logo-instm"
          onerror="this.style.display='none'">

        <img src="assets/images/iica-azul.png"
          alt="IICA" class="share-logo-inst"
          onerror="this.style.display='none'">
      </div>
    </div>

    <div class="share-body">
      <div class="share-user-meta">
        <div class="share-user-details">
          <h2 class="compact-white-name"
            style="font-size:${fontSizeNombre} !important;">
            ${estudianteGlobal.nombre}
          </h2>

          <p class="share-user-sub">
            <span>
              <i class="fa-solid fa-id-card"></i>
              <b>${estudianteGlobal.cedula}</b>
            </span>

            <span class="share-separator">•</span>

            <span>
              <i class="fa-solid fa-route"></i>
              Ruta Tecnológica:
              <b>${estudianteGlobal.ruta.toUpperCase()}</b>
            </span>

            <span class="share-separator">•</span>

            <span>
              <i class="fa-regular fa-calendar-check"></i>
              <b>
                ${new Date().toLocaleDateString("es-CR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </b>
            </span>
          </p>
        </div>

        <div class="share-user-stats">
          <div class="badge-logro-premium">
            <div class="badge-premium-icon">
              <i class="fa-solid fa-medal"></i>
            </div>

            <div class="badge-premium-content">
              <div class="badge-premium-title">
                <span class="badge-hours-highlight">
                  ${totalCursosLogrados === 1 ? "Nuevo" : totalCursosLogrados}
                </span>

                ${totalCursosLogrados === 1
                  ? "Logro de aprendizaje"
                  : "Logros de aprendizaje"}
              </div>

              <div class="badge-premium-subtitle">
                En innovación tecnológica
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="showcase-container ${esUnaHilera ? "one-row-case" : ""}">
        <div class="compact-medal-case-dynamic"
          style="grid-template-columns:repeat(${columnasGrid}, 1fr);">
          ${medallasHTML}
        </div>

        ${trofeoHTML}
      </div>
    </div>

    <div class="share-footer">
      <div class="share-footer-left-block">
        <div class="share-footer-text">
          <span>
            <i class="fa-solid fa-shield-halved"></i>
            Portafolio de Habilidades Digitales • AgroLINC
          </span>

          <p>
            ¡Escanea el código QR para comprobar mis cursos aprobados
            y seguir mi avance en la plataforma!
          </p>
        </div>

        <img src="assets/images/fablab.png"
          alt="FABLAB"
          class="share-logo-footer-inst"
          onerror="this.style.display='none'">
      </div>

      <div class="share-footer-qr">
        <img src="${qrApiUrl}"
          alt="Código QR de Verificación"
          class="share-qr-image">
      </div>
    </div>
  `;

  setTimeout(() => {
    html2canvas(shareContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#081d38",
      scale: 2,
      width: 1200,
      height: 720,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 720,

      onclone: clonedDoc => {
        const iconos = clonedDoc.querySelectorAll(
          ".compact-medal-circle i, .trophy-badge i, .badge-premium-icon i"
        );

        iconos.forEach(icono => {
          icono.style.position = "absolute";
          icono.style.top = "40%";
          icono.style.left = "50%";
          icono.style.transform = "translate(-50%, -50%)";
          icono.style.lineHeight = "1";
        });

        const todosLosTextos = clonedDoc.querySelectorAll(
          ".compact-white-name, .share-user-sub, .badge-logro-premium, .medal-course-title, .medal-course-date, .medal-locked-date, .trophy-title, .share-footer-text span, .share-footer-text p"
        );

        todosLosTextos.forEach(texto => {
          texto.style.position = "relative";
          texto.style.top = "-8px";
          texto.style.lineHeight = "1.8";
        });
      }
    }).then(canvas => {
      const nombreArchivoSafe = estudianteGlobal.nombre
        .trim()
        .replace(/\s+/g, "_");

      const link = document.createElement("a");
      link.download = `AgroLINC_Logros_${nombreArchivoSafe}.png`;
      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(error => {
      console.error("Error en la captura de la tarjeta:", error);
      alert("No se pudo generar la tarjeta de progreso.");
    });
  }, 600);
}

/* =========================================
   INVITACIÓN BOOTCAMP
   Cada curso aprobado se agrega una sola vez.
========================================= */

async function generarInvitacionBootcamp() {
  if (!estudianteGlobal) {
    alert("Primero consulta tu identificación.");
    return;
  }

  if (typeof html2canvas !== "function") {
    alert("No se pudo cargar el generador de imágenes.");
    return;
  }

  const downloadButton = document.getElementById("downloadInvitationBtn");
  const inviteCardNode = document.getElementById("whatsappInviteCard");
  const waStudentName = document.getElementById("waStudentName");
  const waModulesContainer = document.getElementById("waModulesContainer");

  if (!inviteCardNode || !waStudentName || !waModulesContainer) {
    alert("No se encontró la plantilla de invitación.");
    return;
  }

  const nombreCompleto = estudianteGlobal.nombre || "Participante";
  const primerNombreOriginal = nombreCompleto.trim().split(/\s+/)[0];

  const primerNombre =
    primerNombreOriginal.charAt(0).toLocaleUpperCase("es-CR") +
    primerNombreOriginal.slice(1).toLocaleLowerCase("es-CR");

  waStudentName.textContent = `¡Hola, ${primerNombre}!`;

  // Limpiar completamente el contenedor antes de agregar los cursos.
  waModulesContainer.replaceChildren();

  // Filtrar los cursos aprobados y evitar IDs repetidos.
  const idsAprobados = new Set(tuplasGlobales.map(t => t[0]));

  const aprobadosReales = cursosRutaGlobal.filter(curso =>
    idsAprobados.has(curso.id)
  );

  if (aprobadosReales.length > 0) {
    aprobadosReales.forEach(curso => {
      const tuplaCurso = tuplasGlobales.find(
        tupla => tupla[0] === curso.id
      );

      const fechaCompletado =
        tuplaCurso?.[1] || "Fecha no registrada";

      const actividad = document.createElement("div");
      actividad.className = "wa-module-item";

      const check = document.createElement("div");
      check.className = "wa-module-check";

      const icono = document.createElement("i");
      icono.className = "fa-solid fa-circle-check";
      check.appendChild(icono);

      const info = document.createElement("div");
      info.className = "wa-module-info";

      const nombre = document.createElement("span");
      nombre.className = "wa-module-name";
      nombre.textContent = curso.nombre;

      const fecha = document.createElement("span");
      fecha.className = "wa-module-date";

      const iconoFecha = document.createElement("i");
      iconoFecha.className = "fa-regular fa-calendar-check";

      fecha.appendChild(iconoFecha);
      fecha.appendChild(
        document.createTextNode(` Completado el ${fechaCompletado}`)
      );

      info.appendChild(nombre);
      info.appendChild(fecha);

      actividad.appendChild(check);
      actividad.appendChild(info);

      waModulesContainer.appendChild(actividad);
    });
  } else {
    const mensaje = document.createElement("div");
    mensaje.className = "wa-no-modules";
    mensaje.textContent =
      "¡Tu recorrido de aprendizaje en AgroLINC está por comenzar!";

    waModulesContainer.appendChild(mensaje);
  }

  const displayOriginal = inviteCardNode.style.display;
  const styleOriginal = inviteCardNode.getAttribute("style");

  if (downloadButton) downloadButton.disabled = true;

  try {
    // Mostrar fuera del área visible para capturarla sin mostrarla al usuario.
    inviteCardNode.style.display = "flex";
    inviteCardNode.style.position = "fixed";
    inviteCardNode.style.left = "-10000px";
    inviteCardNode.style.top = "0";
    inviteCardNode.style.width = "760px";
    inviteCardNode.style.height = "auto";
    inviteCardNode.style.minHeight = "0";
    inviteCardNode.style.maxHeight = "none";
    inviteCardNode.style.overflow = "visible";
    inviteCardNode.style.boxSizing = "border-box";

    const wrapper = inviteCardNode.querySelector(".whatsapp-invite-wrapper");

    if (wrapper) {
      wrapper.style.width = "100%";
      wrapper.style.maxWidth = "760px";
      wrapper.style.height = "auto";
      wrapper.style.minHeight = "0";
      wrapper.style.maxHeight = "none";
      wrapper.style.overflow = "visible";
      wrapper.style.boxSizing = "border-box";
    }

    // Esperar a que el navegador actualice el diseño y calcule la altura.
    await new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    const alturaReal = Math.max(
      inviteCardNode.scrollHeight,
      wrapper ? wrapper.scrollHeight : 0,
      1100
    );

    const canvas = await html2canvas(inviteCardNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 760,
      height: alturaReal - 200,
      windowWidth: 760,
      windowHeight: alturaReal,
      scrollX: 0,
      scrollY: 0,
      logging: false
    });

    const link = document.createElement("a");

    link.download =
      `Invitacion_Bootcamp_AgroLINC_${primerNombre}.png`;

    link.href = canvas.toDataURL("image/png");

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Error generando invitación:", error);
    alert("Ocurrió un error al generar la imagen de invitación.");

  } finally {
    if (styleOriginal !== null) {
      inviteCardNode.setAttribute("style", styleOriginal);
    } else {
      inviteCardNode.removeAttribute("style");
      inviteCardNode.style.display = displayOriginal || "none";
    }

    if (downloadButton) downloadButton.disabled = false;
  }
}

/* =========================================
   EVENTOS PRINCIPALES
   Un solo registro de eventos.
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("AgroLINC iniciado");

  const consultarBtn = document.getElementById("consultarBtn");
  const cedulaInput = document.getElementById("cedulaInput");
  const closeModal = document.getElementById("closeModal");
  const downloadInvitationBtn =
    document.getElementById("downloadInvitationBtn");

  if (consultarBtn) {
    consultarBtn.addEventListener("click", consultarRuta);
  }

  if (cedulaInput) {
    cedulaInput.addEventListener("keydown", event => {
      if (event.key === "Enter") consultarRuta();
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal = document.getElementById("courseModal");
      if (modal) modal.classList.remove("active");
    });
  }

  if (downloadInvitationBtn) {
    downloadInvitationBtn.addEventListener(
      "click",
      generarInvitacionBootcamp
    );
  } else {
    console.warn(
      "No se encontró el botón #downloadInvitationBtn en ruta.html"
    );
  }
});
