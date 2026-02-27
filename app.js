const express = require("express");
const cors = require("cors");
const path = require("path");
const { createAppointment, getAppointments } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function validateAppointmentPayload(payload) {
  const { patientName, doctorName, date, time } = payload;
  if (!patientName || !doctorName || !date || !time) {
    return "All fields are required.";
  }
  return null;
}

async function handleGetAppointments(req, res) {
  try {
    const appointments = await getAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Failed to read appointments", error);
    res.status(500).json({ message: "Unable to load appointments" });
  }
}

async function handleCreateAppointment(req, res) {
  const validationError = validateAppointmentPayload(req.body || {});
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { patientName, doctorName, date, time } = req.body;

  try {
    const appointment = await createAppointment({ patientName, doctorName, date, time });
    return res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Failed to create appointment", error);
    return res.status(500).json({ message: "Unable to book appointment" });
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// New API routes
app.get("/api/appointments", handleGetAppointments);
app.post("/api/appointments", handleCreateAppointment);

// Backward-compatible legacy routes to reduce integration/merge risk
app.get("/appointments", handleGetAppointments);
app.post("/book", handleCreateAppointment);

module.exports = app;
