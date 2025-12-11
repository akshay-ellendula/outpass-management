import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// DB Config
import connect_Db from './config/config_db.js';

// Routes Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // New
import wardenRoutes from './routes/wardenRoutes.js'; // New

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
app.use("/api/auth", authRoutes);       // Login/Logout
app.use("/api/admin", adminRoutes);     // Admin creating Wardens
app.use("/api/warden", wardenRoutes);   // Warden creating Students/Security

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});