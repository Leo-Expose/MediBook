const express = require("express");
const cors = require("cors");
const path = require("path");
const { createAppointment, getAppointments } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await getAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Failed to read appointments", error);
    res.status(500).json({ message: "Unable to load appointments" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { patientName, doctorName, date, time } = req.body;

  if (!patientName || !doctorName || !date || !time) {
    return res.status(400).json({ message: "All fields are required." });
  }

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
});

module.exports = app;
