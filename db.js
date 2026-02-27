const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "medibook.db");
const isVercel = Boolean(process.env.VERCEL);
const sqliteBinaryAvailable = (() => {
  try {
    execFileSync("sqlite3", ["--version"], { encoding: "utf8" });
    return true;
  } catch (_error) {
    return false;
  }
})();

const canUseSqlite = sqliteBinaryAvailable && !isVercel;

let memoryAppointments = [];
let memoryId = 1;

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function runSql(query) {
  return execFileSync("sqlite3", ["-json", dbPath, query], {
    encoding: "utf8",
  }).trim();
}

function ensureDataDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initSqlite() {
  ensureDataDir();
  execFileSync(
    "sqlite3",
    [
      dbPath,
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
    ],
    { encoding: "utf8" }
  );
}

if (canUseSqlite) {
  try {
    initSqlite();
  } catch (error) {
    console.error("SQLite init failed, falling back to in-memory storage", error);
  }
}

function normalizeRow(row) {
  return {
    id: Number(row.id),
    patientName: row.patientName,
    doctorName: row.doctorName,
    date: row.date,
    time: row.time,
    createdAt: row.createdAt,
  };
}

async function getAppointments() {
  if (canUseSqlite) {
    try {
      const output = runSql(`SELECT id,
                                    patient_name AS patientName,
                                    doctor_name AS doctorName,
                                    appointment_date AS date,
                                    appointment_time AS time,
                                    created_at AS createdAt
                             FROM appointments
                             ORDER BY datetime(created_at) DESC, id DESC;`);
      const rows = output ? JSON.parse(output) : [];
      return rows.map(normalizeRow);
    } catch (error) {
      console.error("SQLite read failed, using in-memory fallback", error);
    }
  }

  return [...memoryAppointments].sort((a, b) => b.id - a.id);
}

async function createAppointment({ patientName, doctorName, date, time }) {
  if (canUseSqlite) {
    try {
      const patient = sqlEscape(patientName);
      const doctor = sqlEscape(doctorName);
      const safeDate = sqlEscape(date);
      const safeTime = sqlEscape(time);

      runSql(`INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time)
              VALUES ('${patient}', '${doctor}', '${safeDate}', '${safeTime}');`);

      const rows = await getAppointments();
      return rows[0];
    } catch (error) {
      console.error("SQLite write failed, using in-memory fallback", error);
    }
  }

  const appointment = {
    id: memoryId,
    patientName,
    doctorName,
    date,
    time,
    createdAt: new Date().toISOString(),
  };
  memoryId += 1;
  memoryAppointments.push(appointment);
  return appointment;
}

module.exports = {
  createAppointment,
  getAppointments,
  storageMode: canUseSqlite ? "sqlite" : "memory",
};
