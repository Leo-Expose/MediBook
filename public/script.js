async function bookAppointment() {
    const patientName = document.getElementById("patientName").value;
    const doctorName = document.getElementById("doctorName").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const response = await fetch("http://localhost:3000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName, doctorName, date, time })
    });

    const data = await response.json();
    alert(data.message);

    loadAppointments();
}

async function loadAppointments() {
    const response = await fetch("http://localhost:3000/appointments");
    const appointments = await response.json();

    const list = document.getElementById("appointmentsList");
    list.innerHTML = "";

    appointments.forEach(app => {
        list.innerHTML += `
            <p>
                ${app.patientName} booked ${app.doctorName} 
                on ${app.date} at ${app.time}
            </p>
        `;
    });
}

loadAppointments();