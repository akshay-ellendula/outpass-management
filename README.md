# 🚀 Smart Outpass Management System

A comprehensive, role-based web application to digitalize and streamline the hostel outpass process. It connects Students, Wardens, Security Guards, and Administrators in a secure, real-time workflow.

---

## Features

- Role-based authentication and JWT cookie sessions
- Day-pass and Home-pass workflows (guardian approval for home passes)
- QR-code based pass generation and gate scanning
- Real-time gate entry/exit logging and defaulter detection
- Email notifications (Nodemailer)
- Role-specific dashboards and management (Admin / Warden / Security / Student)

---

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, Mongoose (MongoDB)
- Auth: JWT stored in secure HTTP-only cookie
- Email: Nodemailer (Gmail recommended with app password)

---

## Default Development Credentials (Change in production)

> These example credentials are only for local development/testing. Change them before deploying.

- **Admin** — username: `admin` / password: `admin123`
- **Warden** — example ID: `WRD-7234` / password: `123456`
- **Security** — example ID: `SEC-1011` / password: `123456`
- **Student** — s20230010079 / 12345678

---

## Installation & Setup

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- Git

### 1) Clone repository

```bash
git clone <your-repo-url>
cd outpass-management
```

### 2) Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=Smart_Outpass_Admin
```

Start backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 3) Frontend setup

```bash
cd client
npm install
```

Create a `.env` in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## Project Structure (high level)

```
outpass-management/
├─ client/        # React frontend (Vite)
└─ server/        # Express backend
   └─ src/
      ├─ config/
      ├─ controller/
      ├─ middleware/
      ├─ models/
      ├─ routes/
      └─ utils/
```

---

## Selected API Endpoints

- **Auth**
  - `POST /api/auth/studentSignin`
  - `POST /api/auth/wardenSignin`
  - `POST /api/auth/securitySignin`
  - `POST /api/auth/adminSignin`

- **Student**
  - `POST /api/student/apply/day` — Apply Day Pass
  - `POST /api/student/apply/home` — Apply Home Pass
  - `GET  /api/student/dashboard`
  - `GET  /api/student/public/pass/:token` — Guardian view
  - `POST /api/student/public/pass/:token/action` — Guardian action

- **Warden**
  - `GET /api/warden/pass-requests`
  - `PUT /api/warden/pass-requests/:id`

- **Gate**
  - `POST /api/gate/verify` — Gate entry/exit logging

- **Admin**
  - `GET /api/admin/dashboard-stats`

Refer to `server/src/routes` for the complete route list.

## License

This project is licensed under the ISC License.
