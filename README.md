# 🩺 MediBook — Appointment Booking System

A modern, full-stack appointment booking application built with **Node.js**, **Express**, and **Supabase**.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## ✨ Features

- **Book Appointments** — Patients can book with available specialists
- **Admin Panel** — Secure login with full appointment management
  - Add new appointments
  - Reschedule with date/time picker
  - Delete with confirmation
  - Stats dashboard (total, scheduled, rescheduled, cancelled)
- **Modern UI** — Dark glassmorphism design with smooth animations
- **Toast Notifications** — Elegant feedback instead of alerts
- **Date Validation** — Cannot book in the past
- **Responsive** — Works perfectly on mobile and desktop
- **Secure** — JWT auth, bcrypt passwords, Supabase RLS

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript |
| **Backend** | Node.js, Express |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT + bcrypt |
| **Fonts** | Google Fonts (Inter) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/Medibook.git
cd Medibook
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-64-char-secret
```

> **Where to find the service role key:**  
> Supabase Dashboard → Project Settings → API → `service_role` (secret)

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to book appointments.  
Open [http://localhost:3000/admin.html](http://localhost:3000/admin.html) for the admin panel.

---

## 🔐 Admin Credentials

| Field | Value |
|---|---|
| Username | `Jishnu` |
| Password | `leoisgod` |

---

## 📁 Project Structure

```
Medibook/
├── api/
│   └── index.js          # Vercel serverless entry
├── public/
│   ├── index.html         # Public booking page
│   ├── style.css          # Public design system
│   ├── script.js          # Public booking logic
│   ├── admin.html         # Admin panel
│   ├── admin.css          # Admin panel styles
│   └── admin.js           # Admin panel logic
├── app.js                 # Express routes & middleware
├── db.js                  # Supabase database client
├── server.js              # Server entry point
├── vercel.json            # Vercel routing config
├── package.json
└── .env                   # Environment variables (not committed)
```

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in **Project Settings → Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
4. Deploy!

---

## 📝 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Public | List active appointments |
| `POST` | `/api/appointments` | Public | Book a new appointment |
| `POST` | `/api/admin/login` | Public | Admin login → JWT |
| `GET` | `/api/admin/appointments` | Admin | List all appointments |
| `PUT` | `/api/appointments/:id` | Admin | Reschedule appointment |
| `DELETE` | `/api/appointments/:id` | Admin | Delete appointment |

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **service_role key** used server-side only — never exposed to the browser
- **JWT tokens** expire after 1 hour
- **bcrypt** hashed admin passwords
- **`.env`** file is `.gitignore`'d — secrets never reach Git

---

## 📄 License

[MIT](LICENSE)
