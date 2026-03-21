// ── Toast Notifications ─────────────────────────────────────────
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

// ── Book Appointment ────────────────────────────────────────────
async function bookAppointment() {
  const patientName = document.getElementById("patientName").value.trim();
  const doctorName = document.getElementById("doctorName").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!patientName || !doctorName || !date || !time) {
    showToast("Please fill in all fields before booking.", "error");
    return;
  }

  // Prevent past bookings
  const chosen = new Date(`${date}T${time}`);
  if (chosen < new Date()) {
    showToast("Cannot book appointments in the past.", "error");
    return;
  }

  const btn = document.getElementById("bookBtn");
  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");
  btn.disabled = true;
  btnText.textContent = "Booking…";
  btnLoader.style.display = "inline-block";

  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, doctorName, date, time }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Unable to book appointment.", "error");
      return;
    }

    showToast("Appointment booked successfully! 🎉", "success");
    document.getElementById("patientName").value = "";
    document.getElementById("doctorName").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";

    await loadAppointments();
  } catch {
    showToast("Network error. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = "Book Appointment";
    btnLoader.style.display = "none";
  }
}

// ── Load Appointments ───────────────────────────────────────────
async function loadAppointments() {
  const list = document.getElementById("appointmentsList");
  const emptyState = document.getElementById("emptyState");

  try {
    const response = await fetch("/api/appointments");
    const appointments = await response.json();

    list.innerHTML = "";

    if (appointments.length === 0) {
      list.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    list.style.display = "grid";
    emptyState.style.display = "none";

    appointments.forEach((appt, i) => {
      const card = document.createElement("div");
      card.className = "appointment-card";
      card.style.animationDelay = `${i * 0.08}s`;

      const statusClass = `status-${appt.status || "scheduled"}`;
      const statusLabel = appt.status
        ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1)
        : "Scheduled";

      const formattedDate = new Date(appt.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short", year: "numeric", month: "short", day: "numeric",
      });

      const formattedTime = formatTime(appt.time);

      card.innerHTML = `
        <div class="card-header">
          <span class="card-doctor">${escapeHtml(appt.doctorName)}</span>
          <span class="card-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="card-info">
          <div class="card-row">
            <span class="card-row-icon">👤</span>
            <span>${escapeHtml(appt.patientName)}</span>
          </div>
          <div class="card-row">
            <span class="card-row-icon">📅</span>
            <span>${formattedDate}</span>
          </div>
          <div class="card-row">
            <span class="card-row-icon">🕐</span>
            <span>${formattedTime}</span>
          </div>
        </div>
      `;

      list.appendChild(card);
    });
  } catch {
    showToast("Failed to load appointments.", "error");
  }
}

// ── Helpers ─────────────────────────────────────────────────────
function formatTime(timeStr) {
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

// ── Navbar Scroll Effect ────────────────────────────────────────
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  nav.classList.toggle("scrolled", window.scrollY > 20);
});

// ── Set Min Date ────────────────────────────────────────────────
(function setMinDate() {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }
})();

// ── Init ────────────────────────────────────────────────────────
loadAppointments();
