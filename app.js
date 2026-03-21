const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  getAppointments,
  getAllAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  getAdminByUsername,
} = require("./db");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Auth Middleware ──────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ── Health ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ── Public Routes ────────────────────────────────────────────────────
app.get("/api/appointments", async (_req, res) => {
  try {
    const appointments = await getAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Failed to read appointments:", error);
    res.status(500).json({ message: "Unable to load appointments" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { patientName, doctorName, date, time } = req.body;

  if (!patientName || !doctorName || !date || !time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Prevent booking in the past
  const appointmentDate = new Date(`${date}T${time}`);
  if (appointmentDate < new Date()) {
    return res.status(400).json({ message: "Cannot book appointments in the past." });
  }

  try {
    const appointment = await createAppointment({ patientName, doctorName, date, time });
    return res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return res.status(500).json({ message: "Unable to book appointment" });
  }
});

// ── Admin Login ──────────────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  try {
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, username: admin.username });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed." });
  }
});

// ── Admin Protected Routes ───────────────────────────────────────────
app.get("/api/admin/appointments", adminAuth, async (_req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Failed to read appointments:", error);
    res.status(500).json({ message: "Unable to load appointments" });
  }
});

app.delete("/api/appointments/:id", adminAuth, async (req, res) => {
  try {
    await deleteAppointment(req.params.id);
    res.json({ message: "Appointment deleted." });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    res.status(500).json({ message: "Unable to delete appointment" });
  }
});

app.put("/api/appointments/:id", adminAuth, async (req, res) => {
  const { patientName, doctorName, date, time } = req.body;

  if (!date && !time && !patientName && !doctorName) {
    return res.status(400).json({ message: "Provide at least one field to update." });
  }

  try {
    const updated = await updateAppointment(req.params.id, {
      patientName,
      doctorName,
      date,
      time,
      status: "rescheduled",
    });
    res.json({ message: "Appointment rescheduled.", appointment: updated });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    res.status(500).json({ message: "Unable to update appointment" });
  }
});

module.exports = app;
