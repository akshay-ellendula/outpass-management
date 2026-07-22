# Smart Outpass Management System - Architecture Guide

## Overview
The Smart Outpass Management System is a comprehensive, role-based full-stack web application designed to digitalize and streamline the hostel outpass process. It uses a **MERN stack** (MongoDB, Express, React, Node.js) with additional libraries for QR code scanning, email notifications, and JWT-based authentication.

---

## 🏗️ Technology Stack

### Backend
- **Express.js** - Web framework for Node.js
- **MongoDB + Mongoose** - NoSQL database and ODM
- **JWT (jsonwebtoken)** - Token-based authentication
- **Bcryptjs** - Password hashing
- **Cookie Parser** - Parsing HTTP-only cookies securely
- **Nodemailer** - Email notifications and services
- **Cors** - Cross-origin resource sharing configuration
- **Dotenv** - Environment variables management

### Frontend
- **React 19** - UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first styling framework
- **Axios** - Promise-based HTTP client
- **React Router** - Client-side routing
- **React Hot Toast** - Elegant toast notifications
- **React QR Scanner** - Barcode and QR code scanning for gate passes
- **Lucide React / Phosphor Icons** - Iconography
- **Date-fns** - Modern JavaScript date utility library

---

## 🔄 How Frontend Connects to Backend

### 1. **Axios Configuration** (`client/src/lib/axios.js`)
The application uses a globally configured Axios instance to ensure backend requests are consistent.
```javascript
// Example configuration logic
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // typically http://localhost:5000/api
  withCredentials: true // Ensures HTTP-only cookies (JWT) are sent with requests
});
```

**What this does:**
- Centralizes API endpoint configuration for local and production URLs.
- Ensures credentials (specifically JWT cookies) are attached to every cross-origin request.

### 2. **API Calls Flow**
```
Frontend Component (e.g., Dashboard or Apply Pass)
  ↓
AuthContext or local state logic
  ↓
axiosInstance (sends request + cookies)
  ↓
Backend Server (http://localhost:5000)
  ↓
Route Handler → Middleware (Role/Auth check) → Controller → MongoDB
  ↓
Response sent back with data/error message
```

---

## 🔐 Middleware & Their Functions

### **Auth Middleware** (`server/src/middleware/authMiddleware.js`)
Since this is a multi-role application, the backend utilizes robust role-based middleware functions to control access.

**What it does:**
- Verifies the JWT token attached in the HTTP-only cookies from the client request.
- Decodes the payload to establish user identity and role (Student, Warden, Security, Admin).
- Rejects access with `401 Unauthorized` if no valid token is found.
- Restricts endpoints based on roles (e.g., blocking a Student from accessing Warden approval routes).

**Where it's used:**
- Any endpoint involving sensitive data or pass workflows. 
- E.g., student pass applications, warden approvals, security gate scans, admin dashboards.

---

## 🌐 Backend Request Flow

### Server Setup (`server/src/server.js`)
```
1. Load environment variables (.env)
2. Connect to MongoDB (Mongoose)
3. Apply global middleware:
   ├── CORS (configured with credentials: true and frontend origin)
   ├── Express.json() (parse incoming JSON payloads)
   └── Cookie Parser (parse JWT cookies)
4. Mount respective routes:
   ├── /api/auth
   ├── /api/student
   ├── /api/warden
   ├── /api/gate
   └── /api/admin
5. Start server on PORT (default 5000)
```

---

## 🔑 Authentication Flow

### 1. **Login Process (Role-Based)**
```
User selects role and enters credentials (e.g. Student ID & Password)
  ↓
Frontend POSTs to specific auth route (e.g., /api/auth/studentSignin)
  ↓
Backend verifies credentials using bcrypt against database
  ↓
Backend generates a JWT payload with role and user ID
  ↓
Backend sets an HTTP-only cookie with the JWT and returns user data
  ↓
Browser securely stores cookie; Frontend updates AuthContext
```

### 2. **Session Persistence**
- The JWT resides in an HTTP-only cookie, heavily mitigating XSS attacks.
- On a page refresh, the frontend relies on an endpoint (e.g., a `/me` or verification route) or valid API calls to confirm if the session is still active via the implicitly attached cookie.

---

## 📦 Frontend State Management

### **AuthContext** (`client/src/context/AuthContext.jsx`)
Instead of Redux, the frontend relies on the React Context API to manage the global authentication state across the application.

```
Stores:
- user: object containing the authenticated user's details and role
- isAuthenticated: boolean status of login
- loading: boolean for initial token verification checks

Provides:
- Context provider wrapping the application
- Global sign-in and logout methods
- Clean state clearance on session expiration
```

**Usage:**
```javascript
import { useAuth } from '../context/AuthContext';
const { user, isAuthenticated, logout } = useAuth();
```

---

## 🔒 Security Implementation

### 1. **JWT in HTTP-Only Cookies**
- Tokens are not stored in `localStorage` or `sessionStorage`.
- HTTP-only flag prevents client-side JS from accessing the token, protecting against Cross-Site Scripting (XSS).

### 2. **CORS Strict Origin**
- CORS is explicitly configured to accept requests only from the specified frontend URL (e.g., `http://localhost:5173`), safeguarding against Cross-Site Request Forgery (CSRF) in tandem with SameSite cookie attributes.

### 3. **Role-Based Routing (Frontend & Backend)**
- Frontend uses `react-router` wrappers to prevent unauthorized users from viewing protected pages.
- Backend completely isolates API actions based on the JWT payload role.

---

## 📡 How Specific Features Work

### **Pass Generation & QR Flow**
```
1. Student applies for a pass (Day/Home) via Frontend.
2. Request is saved to DB with "Pending" status.
3. Warden sees pending request and Approves it. (If home pass, guardian approval via Email may be requested first).
4. DB updates status to "Approved" and generates a unique secure token.
5. Frontend renders a QR code mapping to that unique token.
```

### **Gate Scanning Flow**
```
1. Security Guard uses tablet/phone scanner (react-qr-scanner).
2. Guard scans the student's QR code.
3. Frontend sends POST /api/gate/verify with scanned token.
4. Backend verifies token, checks if it's an Exit or Entry event, logs the timestamp.
5. If valid, Frontend shows green success toast. If invalid/expired, shows red error toast.
```

---

## 📂 File Organization

```
Backend (server/):
├── src/
│   ├── config/          → DB connection and third-party setups
│   ├── controller/      → Business logic (auth, student, warden, etc.)
│   ├── middleware/      → Auth & Role validation logic
│   ├── models/          → Mongoose Schemas (User, Pass, Logs)
│   ├── routes/          → API route definitions
│   ├── utils/           → Helper functions (Nodemailer, Token generators)
│   └── server.js        → Main entry point
├── .env                 → Backend environment variables
└── package.json

Frontend (client/):
├── src/
│   ├── components/      → Reusable UI elements (Buttons, Modals, Layouts)
│   ├── context/         → AuthContext for global state
│   ├── lib/             → Library configs (axios.js)
│   ├── pages/           → Role-specific pages (AdminDash, StudentDash, ScanQR)
│   ├── App.jsx          → Main React router and layout wrap
│   ├── main.jsx         → React DOM render entry
│   └── index.css        → Tailwind base injections
├── .env                 → Frontend environment variables
├── vite.config.js       → Vite configuration
└── package.json
```

---

## ✅ Key Points to Remember

1. **Four distinct roles:** Admin, Warden, Security, and Student. Never mix their dashboards.
2. **Authentication** is strictly via HTTP-only cookies containing a JWT.
3. **Axios** configuration `withCredentials: true` is absolutely critical for APIs to work.
4. **QR Codes** are dynamically generated on the client based on secure tokens from the backend.
5. **Nodemailer** requires a valid App Password (if using Gmail) in the `.env` file for guardian/pass notifications to work.
6. **Vite** requires environment variables to be prefixed with `VITE_` (e.g., `VITE_API_URL`).

---

## 🔗 Related Files Quick Reference

| Feature | Files |
|---------|-------|
| **Global API Config** | `client/src/lib/axios.js` |
| **Auth State** | `client/src/context/AuthContext.jsx` |
| **Route Protection** | `server/src/middleware/authMiddleware.js` |
| **Gate Scanning** | `client/src/pages/Security/...` , `server/src/routes/gateRoutes.js` (assuming) |
| **Email Services** | `server/src/utils/` (nodemailer helper) |
