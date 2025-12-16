# Smart Outpass — Backend Analysis & Preparation

Date: 2025-12-14

## 1) Overview
- Project: Smart Outpass Management System (backend under `server/src`).
- Purpose: digitalize hostel pass workflows (Day/Home passes) with role-based access.

## 2) Files scanned
- `server/src/server.js`
- `server/src/config/config_db.js`
- Controllers: `authcontroller.js`, `adminController.js`, `wardenController.js`
- Middleware: `authMiddleware.js`
- Models: `adminModel.js`, `wardenModel.js`, `securityModel.js`, `studentModel.js`
- Models present but empty: `dayPassModel.js`, `homePassModel.js`
- Routes: `authRoutes.js`, `adminRoutes.js`, `wardenRoutes.js`
- Utils: `sendEmail.js`

## 3) High-level server behavior
- Entry: `server/src/server.js` — loads env, connects to MongoDB, mounts three route groups:
  - `/api/auth` — authentication endpoints
  - `/api/admin` — admin-only actions
  - `/api/warden` — warden actions (create student/security)
- CORS origin set to `http://localhost:5173` and cookies enabled.

## 4) Models summary
- `Admin` — `username`, `password`, `role`, `isActive`; password hashed in `pre('save')`.
- `Warden` — `empId`, `name`, `email`, `password`, `phone`, `assignedBlock`, reset tokens; password hashed.
- `Security` — `guardId`, `name`, `password`, `gateLocation`, `shift`, `isActive`.
- `Student` — `regNo`, `name`, `email`, `password`, `phone`, `hostelBlock`, `roomNo`, `parentName`, `parentEmail`, `parentPhone`, `isDefaulter` (important), `isActive`, reset tokens; password hashed.
- `dayPassModel.js`, `homePassModel.js` — empty files (missing pass schema and logic).

## 5) Controllers & responsibilities
- `authcontroller.js` handles signin for `student`, `warden`, `security`, `admin`; token generation via JWT cookie; password reset flow (forgot/reset) using `sendEmail`.
- `adminController.js` exposes `createWarden` (validations, duplicate checks, creation).
- `wardenController.js` exposes `createStudent` and `createSecurity` (validations, duplicates, creation).

## 6) Routes and access control
- `authRoutes.js` — public auth endpoints (signin/signup/forgot/reset/verify/logout).
- `adminRoutes.js` — protected by `protect` + `authorize('admin')`.
- `wardenRoutes.js` — protected by `protect` + `authorize('warden')`.
- `protect` middleware verifies JWT cookie and attaches `req.user` (Admin/Warden lookup). `authorize` checks role inclusion.

## 7) Key findings & gaps (important)
1. Defaulter flag exists: `Student.isDefaulter` — good and matches requirements.
2. No pass models/controllers: `dayPassModel.js` and `homePassModel.js` are empty, and there are no routes/controllers to create/approve passes or scan QR codes. Core pass workflows are missing.
3. No movement logging: `MOVEMENT_LOGS` entity not implemented (exit/entry timestamps, late detection).
4. Guardian approval flow (email link) is partially implemented only in `authcontroller` password emails; Home Pass guardian approval endpoints and secure token flow are missing.
5. Time restriction (Day Pass between 05:00–21:00) not enforced anywhere.
6. QR generation/validation is not implemented.
7. No automated late-return -> mark defaulter logic; only the `isDefaulter` field and manual warden clearing are present.

## 8) Recommended data schemas (suggested)
- `PassRequest` (single collection for day/home):
  - `passId` (ObjectId)
  - `studentId` (ref Student)
  - `passType` ('DAY'|'HOME')
  - `status` ('PENDING'|'APPROVED'|'REJECTED'|'COMPLETED')
  - `guardianApproved` (boolean)
  - `wardenApproved` (boolean)
  - `qrCode` (string, unique)
  - `reason`, `requestedAt`, `validFrom`, `validTo`, `createdBy`

- `MovementLog`:
  - `logId`, `passId` (ref), `studentId`, `exitTime`, `entryTime`, `isLate` (boolean), `processedBy` (securityId)

- `Defaulter` view can be derived from `Student.isDefaulter` plus a history collection storing `markedAt`, `reason`, `clearedAt`, `clearedBy`.

## 9) Recommended API endpoints (minimal set to implement)
- POST `/api/warden/create-student` — already exists.
- POST `/api/pass/create` — create Day/Home pass (server must check `Student.isDefaulter` first).
  - Validate: if `isDefaulter === true` -> respond 403 with message.
  - For Home Pass: create a guardian approval token + send email with secure link (signed token or DB-stored token).
- GET `/api/pass/:id` — view pass & QR (student/warden/security with permissions).
- POST `/api/pass/:id/approve/warden` — warden approval.
- POST `/api/pass/:id/guardian-approve?token=...` — guardian approval via tokenized link.
- POST `/api/scan/:passId/exit` — security logs exit (generates log with exitTime and marks pass status as 'APPROVED'->'IN_PROGRESS').
- POST `/api/scan/:passId/entry` — security logs entry, compute `isLate` (compare `validTo`), if late mark `Student.isDefaulter = true` and insert into defaulter history.
- POST `/api/warden/:studentId/clear-defaulter` — warden clears defaulter flag (already wanted behavior).

## 10) Enforcement points for Defaulter Check (implementation notes)
1. Frontend: disable UI buttons when API returns `isDefaulter === true` from `/api/auth/verify` or `/api/student/me`.
2. Backend (must enforce): Every pass creation endpoint must query `Student.isDefaulter` and return 403 with the message:
   > “You are marked as a defaulter. Please contact the warden before creating a new pass.”
3. Security scan endpoints must set `isLate` and mark `Student.isDefaulter = true` if return is late.

## 11) Validation & business rules mapping
- Time validation: When creating/approving Day Pass ensure `validFrom` and `validTo` fall between 05:00 and 21:00 local time.
- Unique QR: Generate a strong, unique token per approved pass (e.g., UUIDv4 or signed JWT with pass id) and store in `PassRequest.qrCode` with unique index.
- Token expiry: QR must expire after `validTo` and cannot be reused after completion; on successful entry mark pass as `COMPLETED` and invalidate QR.

## 12) Security & operations
- Use HTTPS and set cookie `secure: true` in production. Keep `httpOnly` for JWT cookie.
- Store `JWT_SECRET_KEY`, `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM_NAME` in `.env` (already expected).
- Rate-limit endpoints like login and password reset to avoid abuse.

## 13) Run & env (how to start backend locally)
1. Create `.env` with at least:
   - `MONGO_URI`, `PORT`, `JWT_SECRET_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM_NAME`
2. Install dependencies: run `npm install` in `server` folder.
3. Start server (development): `npm run dev` or `node src/server.js` depending on `package.json` scripts.

## 14) Immediate next steps (implementation checklist)
1. Implement `PassRequest` schema (`dayPassModel.js` / `homePassModel.js` or unified `passModel.js`).
2. Add controller and routes for pass creation, approval, guardian approval, scanning, and movement logs.
3. Implement QR generation and validation logic (unique + expiry).
4. Implement late-return detection in scan `entry` handler and mark `Student.isDefaulter = true`.
5. Add endpoints and UI hooks for warden to clear defaulter and view defaulter list.
6. Add unit/integration tests for defaulter enforcement and QR flows.

## 15) Suggested priorities (week-1)
1. Implement pass models + creation endpoint with defaulter check.
2. Implement guardian approval token flow for Home Pass.
3. Implement scan endpoints and movement logs.
4. Add tests and basic frontend integration for disabling buttons when defaulter.

---
If you want, I can: (A) convert this into a PDF here (attempt to install conversion tools), or (B) give a single-command conversion you can run locally. Tell me which you prefer.
