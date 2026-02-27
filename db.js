const path = require("path");
const { execFileSync } = require("child_process");

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "medibook.db");

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function runSql(query) {
  return execFileSync("sqlite3", ["-json", dbPath, query], {
    encoding: "utf8",
  }).trim();
}

function init() {
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

init();

async function getAppointments() {
  const output = runSql(`SELECT id,
                                patient_name AS patientName,
                                doctor_name AS doctorName,
                                appointment_date AS date,
                                appointment_time AS time,
                                created_at AS createdAt
                         FROM appointments
                         ORDER BY datetime(created_at) DESC, id DESC;`);
  return output ? JSON.parse(output) : [];
}

async function createAppointment({ patientName, doctorName, date, time }) {
  const patient = sqlEscape(patientName);
  const doctor = sqlEscape(doctorName);
  const safeDate = sqlEscape(date);
  const safeTime = sqlEscape(time);

  runSql(`INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time)
          VALUES ('${patient}', '${doctor}', '${safeDate}', '${safeTime}');`);

  const rows = await getAppointments();
  return rows[0];
}

module.exports = {
  createAppointment,
  getAppointments,
  usingPostgres: false,
};
