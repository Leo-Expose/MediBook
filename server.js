const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let appointments = [];

// Get all appointments
app.get("/appointments", (req, res) => {
    res.json(appointments);
});

// Book appointment
app.post("/book", (req, res) => {
    const { patientName, doctorName, date, time } = req.body;

    if (!patientName || !doctorName || !date || !time) {
        return res.status(400).json({ message: "All fields required" });
    }

    const appointment = {
        id: appointments.length + 1,
        patientName,
        doctorName,
        date,
        time
    };

    appointments.push(appointment);
    res.json({ message: "Appointment booked successfully!" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});