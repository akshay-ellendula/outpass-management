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
import studentRoutes from './routes/studentRoutes.js';
import gateRoutes from './routes/gateRoutes.js';


const app = express();
connect_Db();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://outpass-management-frontend.vercel.app"
    ],
    credentials: true
}));


// --- MOUNT ROUTES ---
app.use("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Backend Status</title>
            <style>
                body {
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }
                .card {
                    background: rgba(0,0,0,0.25);
                    padding: 30px 40px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                h1 {
                    margin-bottom: 10px;
                }
                p {
                    font-size: 14px;
                    opacity: 0.9;
                }
                .status {
                    margin-top: 15px;
                    font-weight: bold;
                    color: #4ade80;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🚀 Smart Outpass Management System</h1>
                <p>Backend Service Status</p>
                <div class="status">✅ Running Successfully</div>
            </div>
        </body>
        </html>
    `);
});

app.use("/api/auth", authRoutes);       // Login/Logout/Forgot Password
app.use("/api/admin", adminRoutes);     // Admin creating Wardens
app.use("/api/warden", wardenRoutes); 
app.use("/api/student", studentRoutes);
app.use("/api/gate", gateRoutes);       // Security Guard Gate Operations


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));