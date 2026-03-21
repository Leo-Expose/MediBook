const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) throw error;
  return (data || []).map(formatAppointment);
}

async function getAllAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) throw error;
  return (data || []).map(formatAppointment);
}

async function createAppointment({ patientName, doctorName, date, time }) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_name: patientName,
      doctor_name: doctorName,
      appointment_date: date,
      appointment_time: time,
    })
    .select()
    .single();

  if (error) throw error;
  return formatAppointment(data);
}

async function deleteAppointment(id) {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

async function updateAppointment(id, fields) {
  const updateData = {};
  if (fields.patientName) updateData.patient_name = fields.patientName;
  if (fields.doctorName) updateData.doctor_name = fields.doctorName;
  if (fields.date) updateData.appointment_date = fields.date;
  if (fields.time) updateData.appointment_time = fields.time;
  if (fields.status) updateData.status = fields.status;

  const { data, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return formatAppointment(data);
}

async function getAdminByUsername(username) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

function formatAppointment(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    doctorName: row.doctor_name,
    date: row.appointment_date,
    time: row.appointment_time,
    status: row.status,
    createdAt: row.created_at,
  };
}

module.exports = {
  getAppointments,
  getAllAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  getAdminByUsername,
};
