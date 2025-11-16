// ==========================
// CONFIGURACIÓN SUPABASE
// ==========================

// TODO: Reemplaza con tus datos reales de Supabase
const SUPABASE_URL = "https://ejpuxfhohdcabghznqod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcHV4ZmhvaGRjYWJnaHpucW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjExODYsImV4cCI6MjA3ODg5NzE4Nn0.Hql_Y0wTTcV8u84MWt0IXwLZUzpgnkjwJp3acfwHw9M";

// Inicializa supabase si configuraste las variables
let supabaseClient = null;
if (SUPABASE_URL.startsWith("https://TU-")) {
  console.warn("Configura SUPABASE_URL y SUPABASE_ANON_KEY en app.js");
} else {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

// ==========================
// DATOS MOCK (ejemplo)
// ==========================

const mockOTs = [
  {
    id: 1,
    ot: "OT-2025-001",
    vehicle: "Nissan Leaf 2022",
    mechanic: "Carlos Pérez",
    status: "Conforme",
    date: "16-11-2025 10:35",
    whatsappPhone: "56912345678",
    certificateCode: "STC-2025-000123",
    torquePoints: [
      {
        name: "Batería - Soporte frontal",
        targetRange: "85–90 Nm",
        applied: "88 Nm",
        status: "Conforme",
      },
      {
        name: "Batería - Soporte trasero",
        targetRange: "85–90 Nm",
        applied: "86 Nm",
        status: "Conforme",
      },
    ],
    evChecks: [
      {
        name: "Resistencia de aislamiento",
        value: "8.5 MΩ",
        status: "Conforme",
      },
      {
        name: "Balance de celdas",
        value: "±10 mV",
        status: "Conforme",
      },
    ],
    workshop: "Taller STC-EV Santiago",
  },
  {
    id: 2,
    ot: "OT-2025-002",
    vehicle: "Kia Niro EV 2023",
    mechanic: "María López",
    status: "Con observaciones",
    date: "16-11-2025 09:10",
    whatsappPhone: "56912345678",
    certificateCode: "STC-2025-000124",
    torquePoints: [
      {
        name: "Módulo inversor - Soporte lateral",
        targetRange: "45–50 Nm",
        applied: "52 Nm",
        status: "Alerta",
      },
    ],
    evChecks: [
      {
        name: "Resistencia de aislamiento",
        value: "2.1 MΩ",
        status: "Alerta",
      },
    ],
    workshop: "Taller STC-EV Santiago",
  },
];

const mockAlerts = [
  {
    ot: "OT-2025-002",
    type: "Torque",
    detail: "Punto 'Módulo inversor - Soporte lateral' fuera de rango.",
    date: "16-11-2025 09:12",
    state: "Pendiente",
  },
  {
    ot: "OT-2025-002",
    type: "EV",
    detail: "Resistencia de aislamiento bajo umbral crítico.",
    date: "16-11-2025 09:13",
    state: "Pendiente",
  },
];

// ==========================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

navLinks.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sectionId = btn.dataset.section;

    navLinks.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach((s) => {
      if (s.id === sectionId) {
        s.classList.add("visible");
      } else {
        s.classList.remove("visible");
      }
    });
  });
});

// ==========================
// DASHBOARD: KPIs + TABLA
// ==========================

const kpiCertToday = document.getElementById("kpi-cert-today");
const kpiCertCaption = document.getElementById("kpi-cert-caption");
const kpiConforme = document.getElementById("kpi-conforme");
const kpiAlertsActive = document.getElementById("kpi-alerts-active");
const kpiEvCompleted = document.getElementById("kpi-ev-completed");

const recentActivityBody = document.getElementById("recent-activity-body");

// Detalle
const detailPlaceholder = document.getElementById("detail-placeholder");
const detailContent = document.getElementById("detail-content");

const detailOtLabel = document.getElementById("detail-ot-label");
const detailOt = document.getElementById("detail-ot");
const detailVehicle = document.getElementById("detail-vehicle");
const detailMechanic = document.getElementById("detail-mechanic");
const detailStatus = document.getElementById("detail-status");
const detailTorqueList = document.getElementById("detail-torque-list");
const detailEvList = document.getElementById("detail-ev-list");
const btnDownloadPdf = document.getElementById("btn-download-pdf");
const btnOpenWhatsapp = document.getElementById("btn-open-whatsapp");

// global WhatsApp button (sidebar)
const globalWhatsappBtn = document.getElementById("global-whatsapp-btn");

// Carga inicial con datos mock
function loadDashboardMock() {
  const totalCert = mockOTs.length;
  kpiCertToday.textContent = totalCert;
  kpiCertCaption.textContent = "Certificaciones registradas con datos de ejemplo.";

  // porcentaje conforme vs alerta
  let totalPoints = 0;
  let conformes = 0;
  let evCompleted = 0;

  mockOTs.forEach((ot) => {
    ot.torquePoints.forEach((p) => {
      totalPoints++;
      if (p.status === "Conforme") conformes++;
    });

    if (ot.evChecks.length > 0) {
      const allEvOk = ot.evChecks.every((e) => e.status === "Conforme");
      if (allEvOk) evCompleted++;
    }
  });

  const pctConforme = totalPoints ? Math.round((conformes / totalPoints) * 100) : 0;
  kpiConforme.textContent = pctConforme + "%";
  kpiEvCompleted.textContent = evCompleted.toString();

  // alertas
  kpiAlertsActive.textContent = mockAlerts.length.toString();

  // tabla de actividad reciente
  recentActivityBody.innerHTML = "";
  mockOTs.forEach((ot) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ot.ot}</td>
      <td>${ot.vehicle}</td>
      <td>${ot.mechanic}</td>
      <td>${ot.status}</td>
      <td>${ot.date}</td>
      <td><button class="btn-outline btn-sm">Ver detalle</button></td>
    `;
    tr.addEventListener("click", () => showDetail(ot));
    recentActivityBody.appendChild(tr);
  });
}

// VERSION FUTURA: Cargar datos reales desde Supabase
async function loadDashboardFromSupabase() {
  if (!supabaseClient) return;

  try {
    // EJEMPLO DE CONSULTA (ajusta a tu schema):
    // const { data, error } = await supabaseClient
    //   .from("certifications")
    //   .select("*")
    //   .order("created_at", { ascending: false })
    //   .limit(20);
    //
    // if (error) throw error;
    //
    // Mapear data a formato similar a mockOTs y reemplazar.

    // Por ahora usamos mock:
    loadDashboardMock();
  } catch (err) {
    console.error("Error cargando dashboard:", err);
    loadDashboardMock();
  }
}

function showDetail(ot) {
  detailPlaceholder.classList.add("hidden");
  detailContent.classList.remove("hidden");
  detailOtLabel.textContent = ot.ot;
  detailOt.textContent = ot.ot;
  detailVehicle.textContent = ot.vehicle;
  detailMechanic.textContent = ot.mechanic;
  detailStatus.textContent = ot.status;

  detailTorqueList.innerHTML = "";
  ot.torquePoints.forEach((p) => {
    const li = document.createElement("li");
    const isAlert = p.status !== "Conforme";
    li.innerHTML = `
      <strong>${p.name}</strong>  
      <br />Rango: ${p.targetRange} | Aplicado: ${p.applied}
      <br /><span style="color:${isAlert ? "#e53935" : "#16a34a"};font-weight:600;">
        ${p.status}
      </span>
    `;
    detailTorqueList.appendChild(li);
  });

  detailEvList.innerHTML = "";
  ot.evChecks.forEach((e) => {
    const li = document.createElement("li");
    const isAlert = e.status !== "Conforme";
    li.innerHTML = `
      <strong>${e.name}</strong>: ${e.value}
      <br /><span style="color:${isAlert ? "#e53935" : "#16a34a"};font-weight:600;">
        ${e.status}
      </span>
    `;
    detailEvList.appendChild(li);
  });

  // Botón PDF: aquí solo simulamos
  btnDownloadPdf.onclick = () => {
    alert(
      "Aquí deberías abrir/descargar el PDF del chatbot. Por ahora es una simulación."
    );
  };

  // Botón WhatsApp
  btnOpenWhatsapp.onclick = () => {
    openWhatsappForOT(ot);
  };
}

// ==========================
// ALERTAS
// ==========================

const alertsBody = document.getElementById("alerts-body");

function loadAlertsMock() {
  alertsBody.innerHTML = "";
  mockAlerts.forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.ot}</td>
      <td>${a.type}</td>
      <td>${a.detail}</td>
      <td>${a.date}</td>
      <td>${a.state}</td>
    `;
    alertsBody.appendChild(tr);
  });
}

// VERSION FUTURA: Cargar alertas desde Supabase
async function loadAlertsFromSupabase() {
  if (!supabaseClient) {
    loadAlertsMock();
    return;
  }

  try {
    // const { data, error } = await supabaseClient
    //   .from("alerts")
    //   .select("*")
    //   .order("created_at", { ascending: false });
    // if (error) throw error;
    //
    // Mapear data -> mockAlerts-like
    loadAlertsMock();
  } catch (err) {
    console.error("Error cargando alertas:", err);
    loadAlertsMock();
  }
}

// ==========================
// PORTAL DE VERIFICACIÓN
// ==========================

const verificationCodeInput = document.getElementById("verification-code");
const btnVerify = document.getElementById("btn-verify");
const verificationResult = document.getElementById("verification-result");
const verificationEmpty = document.getElementById("verification-empty");

const verificationStatus = document.getElementById("verification-status");
const verificationOt = document.getElementById("verification-ot");
const verificationVehicle = document.getElementById("verification-vehicle");
const verificationWorkshop = document.getElementById("verification-workshop");
const verificationDate = document.getElementById("verification-date");

btnVerify.addEventListener("click", async () => {
  const code = verificationCodeInput.value.trim();
  if (!code) {
    alert("Por favor, ingresa un código de certificado.");
    return;
  }

  // Primero probamos con mock
  const foundMock = mockOTs.find((ot) => ot.certificateCode === code);
  if (foundMock) {
    showVerificationResult(foundMock);
    return;
  }

  // FUTURO: búsqueda real en Supabase
  if (supabaseClient) {
    try {
      // const { data, error } = await supabaseClient
      //   .from("certificates")
      //   .select("*")
      //   .eq("code", code)
      //   .single();
      // if (error) throw error;
      //
      // Mapear data a formato de foundMock y llamar showVerificationResult(...)
      alert("Simulación: Supabase aún no configurado para verificar.");
    } catch (err) {
      console.error("Error verificando certificado:", err);
      alert("No se encontró el certificado o hubo un error.");
    }
  } else {
    alert("Código no encontrado en los datos de ejemplo.");
  }
});

function showVerificationResult(ot) {
  verificationEmpty.classList.add("hidden");
  verificationResult.classList.remove("hidden");

  // Estado simplificado
  let statusText = "Conforme (EV y torque)";
  if (ot.status === "Con observaciones") statusText = "Con observaciones";

  verificationStatus.textContent = statusText;
  verificationOt.textContent = ot.ot;
  verificationVehicle.textContent = ot.vehicle;
  verificationWorkshop.textContent = ot.workshop || "Taller STC-EV";
  verificationDate.textContent = ot.date;
}

// ==========================
// WHATSAPP INTEGRACIÓN
// ==========================

const DEFAULT_WSP_PHONE = "56912345678"; // TODO: reemplaza con el número real del bot

function buildWhatsappUrl(message, phoneOverride) {
  const phone = phoneOverride || DEFAULT_WSP_PHONE;
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMsg}`;
}

function openWhatsappForOT(ot) {
  const message = `Iniciar/continuar certificación para OT ${ot.ot} del vehículo ${ot.vehicle}.`;
  const url = buildWhatsappUrl(message, ot.whatsappPhone);
  window.open(url, "_blank");
}

// botón global (sidebar)
if (globalWhatsappBtn) {
  const message =
    "Iniciar flujo STC-EV para nueva certificación de torque y chequeo EV.";
  globalWhatsappBtn.href = buildWhatsappUrl(message);
}

// ==========================
// INICIALIZACIÓN
// ==========================

function init() {
  loadDashboardFromSupabase();
  loadAlertsFromSupabase();
}

document.addEventListener("DOMContentLoaded", init);
