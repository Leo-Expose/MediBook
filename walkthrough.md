# MediBook — Walkthrough

## What Was Built

### 1. Supabase Database
- Created `appointments` table (`id`, `patient_name`, `doctor_name`, `appointment_date`, `appointment_time`, `status`, `created_at`)
- Created `admins` table (`id`, `username`, `password_hash`, `created_at`)
- **RLS enabled** — anon can only SELECT/INSERT appointments; admins table locked to service_role
- Seeded admin user `Jishnu` with bcrypt-hashed password

### 2. Express Backend
- [db.js](file:///c:/Users/Leo/Documents/Medibook/db.js) — Supabase client with all CRUD operations
- [app.js](file:///c:/Users/Leo/Documents/Medibook/app.js) — Routes with JWT admin auth middleware
- [server.js](file:///c:/Users/Leo/Documents/Medibook/server.js) — Entry point with dotenv

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/appointments` | Public | List active appointments |
| `POST /api/appointments` | Public | Book appointment |
| `POST /api/admin/login` | Public | Admin login → JWT |
| `GET /api/admin/appointments` | JWT | All appointments (admin) |
| `PUT /api/appointments/:id` | JWT | Reschedule |
| `DELETE /api/appointments/:id` | JWT | Delete |

### 3. Admin Panel
- [admin.html](file:///c:/Users/Leo/Documents/Medibook/public/admin.html) — Login screen + dashboard
- Stats cards (total, scheduled, rescheduled, cancelled)
- Data table with reschedule and delete actions
- Add appointment modal
- Delete confirmation modal

### 4. Public UI Redesign
- Dark glassmorphism theme with floating gradient orbs
- Hero section with CTA button
- Booking form with icon inputs
- Appointment cards with status badges
- Toast notifications (replaced `alert()`)
- Responsive mobile design

### 5. Improvements Implemented
- **Status tracking** — `scheduled` / `rescheduled` / `cancelled`
- **Date validation** — prevents booking in the past
- **JWT session management** — 1-hour expiry, auto-logout on 401
- **XSS protection** — [escapeHtml()](file:///c:/Users/Leo/Documents/Medibook/public/script.js#147-152) on all user data
- **Loading states** — spinner on booking button

## ⚠️ Action Required

You need to add your **Supabase service_role key** to the [.env](file:///c:/Users/Leo/Documents/Medibook/.env) file before running:

```
Supabase Dashboard → Project Settings → API → service_role (secret)
```

Paste it as `SUPABASE_SERVICE_ROLE_KEY` in [.env](file:///c:/Users/Leo/Documents/Medibook/.env).

For **Vercel**, set the same 3 env vars in Project Settings → Environment Variables.

## Git
- Committed and pushed to `main` on GitHub
