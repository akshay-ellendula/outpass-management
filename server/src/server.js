import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connect_Db from './config/config_db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wardenRoutes from './routes/wardenRoutes.js';
import passRoutes from './routes/passRoutes.js'; // NEW
import gateRoutes from './routes/gateRoutes.js'; // NEW

const app = express();
connect_Db();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true 
}));

// --- MOUNT ROUTES ---
app.use("/api/auth", authRoutes);       // Login/Logout/Forgot Password
app.use("/api/admin", adminRoutes);     // Admin creating Wardens
app.use("/api/warden", wardenRoutes);   // Warden creating Students/Guards
app.use("/api/pass", passRoutes);       // Student Apply & Warden Approve
app.use("/api/gate", gateRoutes);       // Security Scanning

// Public route for parent approval (no auth middleware required)
// In a real app, you might want a specific controller for this
import { parentApprovalAction } from './controller/passController.js';
app.post("/api/public/parent-action/:token", parentApprovalAction);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));