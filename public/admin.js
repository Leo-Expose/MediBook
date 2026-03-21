// ── State ────────────────────────────────────────────────────────
let authToken = sessionStorage.getItem("medibook_token");
let allAppointments = [];
let modalMode = ""; // "add" | "reschedule"
let activeAppointmentId = null;
let deleteTargetId = null;

// ── Init ─────────────────────────────────────────────────────────
(function init() {
  if (authToken) {
    showDashboard();
  }

  // Allow Enter key on login fields
  document.getElementById("loginPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("loginUsername").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("loginPassword").focus();
  });
})();

// ── Toast ────────────────────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    toast.addEventListener("animationend", () => toast.remove());
  }, 3500);
}

// ── Auth ─────────────────────────────────────────────────────────
async function handleLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  const btn = document.getElementById("loginBtn");
  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");

  if (!username || !password) {
    errorEl.textContent = "Please enter both username and password.";
    errorEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btnText.textContent = "Signing in…";
  btnLoader.style.display = "inline-block";
  errorEl.style.display = "none";

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || "Login failed.";
      errorEl.style.display = "block";
      return;
    }

    authToken = data.token;
    sessionStorage.setItem("medibook_token", authToken);
    document.getElementById("adminUsername").textContent = data.username;
    showDashboard();
    showToast("Welcome back, " + data.username + "!", "success");
  } catch {
    errorEl.textContent = "Network error. Please try again.";
    errorEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btnText.textContent = "Sign In";
    btnLoader.style.display = "none";
  }
}

function handleLogout() {
  authToken = null;
  sessionStorage.removeItem("medibook_token");
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
}

function showDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  loadAdminAppointments();
}

// ── API Helpers ──────────────────────────────────────────────────
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: authHeaders() });
  if (res.status === 401) {
    showToast("Session expired. Please log in again.", "error");
    handleLogout();
    throw new Error("Unauthorized");
  }
  return res;
}

// ── Load Appointments ───────────────────────────────────────────
async function loadAdminAppointments() {
  try {
    const res = await apiFetch("/api/admin/appointments");
    allAppointments = await res.json();
    renderTable();
    updateStats();
  } catch {
    // handled by apiFetch
  }
}

function updateStats() {
  document.getElementById("statTotal").textContent = allAppointments.length;
  document.getElementById("statScheduled").textContent = allAppointments.filter(
    (a) => a.status === "scheduled"
  ).length;
  document.getElementById("statRescheduled").textContent = allAppointments.filter(
    (a) => a.status === "rescheduled"
  ).length;
  document.getElementById("statCancelled").textContent = allAppointments.filter(
    (a) => a.status === "cancelled"
  ).length;
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  const emptyEl = document.getElementById("tableEmpty");

  if (allAppointments.length === 0) {
    tbody.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  tbody.innerHTML = allAppointments
    .map((appt) => {
      const formattedDate = new Date(appt.date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const formattedTime = formatTime(appt.time);
      const statusClass = `status-${appt.status || "scheduled"}`;
      const statusLabel = (appt.status || "scheduled").charAt(0).toUpperCase() + (appt.status || "scheduled").slice(1);

      return `<tr>
        <td>${escapeHtml(appt.patientName)}</td>
        <td>${escapeHtml(appt.doctorName)}</td>
        <td>${formattedDate}</td>
        <td>${formattedTime}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="openRescheduleModal('${appt.id}')">Reschedule</button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${appt.id}')">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

// ── Add / Reschedule Modal ──────────────────────────────────────
function openAddModal() {
  modalMode = "add";
  activeAppointmentId = null;
  document.getElementById("modalTitle").textContent = "Add Appointment";
  document.getElementById("modalConfirmBtn").textContent = "Add Appointment";
  document.getElementById("modalPatient").value = "";
  document.getElementById("modalDoctor").value = "";
  document.getElementById("modalDate").value = "";
  document.getElementById("modalTime").value = "";
  document.getElementById("modalPatientGroup").style.display = "block";
  document.getElementById("modalDoctorGroup").style.display = "block";

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("modalDate").setAttribute("min", today);

  document.getElementById("modal").style.display = "flex";
}

function openRescheduleModal(id) {
  modalMode = "reschedule";
  activeAppointmentId = id;
  const appt = allAppointments.find((a) => a.id === id);
  if (!appt) return;

  document.getElementById("modalTitle").textContent = "Reschedule Appointment";
  document.getElementById("modalConfirmBtn").textContent = "Save Changes";
  document.getElementById("modalPatient").value = appt.patientName;
  document.getElementById("modalDoctor").value = appt.doctorName;
  document.getElementById("modalDate").value = appt.date;
  document.getElementById("modalTime").value = appt.time;
  document.getElementById("modalPatientGroup").style.display = "block";
  document.getElementById("modalDoctorGroup").style.display = "block";

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("modalDate").setAttribute("min", today);

  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function confirmModal() {
  const patient = document.getElementById("modalPatient").value.trim();
  const doctor = document.getElementById("modalDoctor").value;
  const date = document.getElementById("modalDate").value;
  const time = document.getElementById("modalTime").value;

  if (!patient || !doctor || !date || !time) {
    showToast("Please fill all fields.", "error");
    return;
  }

  try {
    if (modalMode === "add") {
      const res = await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({ patientName: patient, doctorName: doctor, date, time }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Failed to add.", "error");
        return;
      }
      showToast("Appointment added!", "success");
    } else {
      const res = await apiFetch(`/api/appointments/${activeAppointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ patientName: patient, doctorName: doctor, date, time }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || "Failed to reschedule.", "error");
        return;
      }
      showToast("Appointment rescheduled!", "success");
    }

    closeModal();
    await loadAdminAppointments();
  } catch {
    showToast("Something went wrong.", "error");
  }
}

// ── Delete Modal ────────────────────────────────────────────────
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById("deleteModal").style.display = "none";
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    const res = await apiFetch(`/api/appointments/${deleteTargetId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showToast("Failed to delete appointment.", "error");
      return;
    }
    showToast("Appointment deleted.", "success");
    closeDeleteModal();
    await loadAdminAppointments();
  } catch {
    showToast("Something went wrong.", "error");
  }
}

// ── Helpers ─────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
