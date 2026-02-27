async function bookAppointment() {
  const patientName = document.getElementById("patientName").value.trim();
  const doctorName = document.getElementById("doctorName").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!patientName || !doctorName || !date || !time) {
    alert("Please fill in all fields before booking.");
    return;
  }

  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientName, doctorName, date, time }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Unable to book appointment.");
    return;
  }

  alert(data.message);
  document.getElementById("patientName").value = "";
  document.getElementById("doctorName").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";

  await loadAppointments();
}

async function loadAppointments() {
  const response = await fetch("/api/appointments");
  const appointments = await response.json();

  const list = document.getElementById("appointmentsList");
  list.innerHTML = "";

  appointments.forEach((app) => {
    const row = document.createElement("p");
    row.textContent = `${app.patientName} booked ${app.doctorName} on ${app.date} at ${app.time}`;
    list.appendChild(row);
  });
}

loadAppointments();
