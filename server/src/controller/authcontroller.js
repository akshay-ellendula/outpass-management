import jwt from 'jsonwebtoken';
import Warden from '../models/wardenModel.js';
import Security from '../models/securityModel.js';
import Admin from '../models/adminModel.js';
import Student from '../models/studentModel.js';
import crypto from 'crypto'; // Built-in Node module
import sendEmail from '../utils/sendEmail.js';

// ==========================================
// 1. LOGIN CONTROLLERS (Keep these)
// ==========================================

// @desc    Signin for Student
export const studentSignin = async (req, res) => {
    const { regNo, password } = req.body;
    try {
        const student = await Student.findOne({ regNo });
        if (!student || !(await student.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        generateTokenAndCookie(res, student._id, 'student');
        res.status(200).json({ success: true, user: { id: student._id, name: student.name, role: 'student' } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Signin for Warden
export const wardenSignin = async (req, res) => {
    const { empId, password } = req.body;
    try {
        const warden = await Warden.findOne({ empId });
        if (!warden || !(await warden.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        generateTokenAndCookie(res, warden._id, 'warden');
        res.status(200).json({ success: true, user: { id: warden._id, name: warden.name, role: 'warden' } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Signin for Security
export const securitySignin = async (req, res) => {
    const { guardId, password } = req.body;
    try {
        const security = await Security.findOne({ guardId });
        if (!security || !(await security.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        generateTokenAndCookie(res, security._id, 'security');
        res.status(200).json({ success: true, user: { id: security._id, role: 'security' } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Signin for Admin
export const adminSignin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        generateTokenAndCookie(res, admin._id, 'admin');
        res.status(200).json({ success: true, user: { id: admin._id, role: 'admin' } });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 2. SETUP CONTROLLER (Keep only for Admin)
// ==========================================

// @desc    Initial Admin Setup (Run once via Postman to create Super Admin)
export const adminSignup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.create({ username, password });
        generateTokenAndCookie(res, admin._id, 'admin');
        res.status(201).json({ success: true, message: "Admin created" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==========================================
// 3. UTILITY CONTROLLERS
// ==========================================

export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
};

export const verifyAuth = async (req, res) => {
    // ... (Keep your existing verifyAuth code here)
    // It verifies the token and returns the user
    // No changes needed logic-wise, just copy-paste your existing one
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(200).json({ authenticated: false });
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // ... (rest of logic)
        res.status(200).json({ authenticated: true, user: decoded }); // simplified for brevity
    } catch (e) {
        res.status(200).json({ authenticated: false });
    }
};

// Helper
const generateTokenAndCookie = (res, userId, role) => {
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    res.cookie('jwt', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production'
    });
};
// @desc    VForgot Password - Send Email
// @route   POST /api/auth/forgotpassword
export const forgotPassword = async (req, res) => {
    const { email, role } = req.body; // User must specify role

    try {
        let user;
        // 1. Find User based on Role
        if (role === 'student') {
            user = await Student.findOne({ email });
        } else if (role === 'warden') {
            user = await Warden.findOne({ email });
        } else {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // 2. Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // 3. Hash token and save to database
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire to 10 minutes
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // 4. Create Reset URL (Frontend URL)
        // Assuming your React frontend runs on localhost:5173
        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                name: user.name,
                subject: 'Password Reset Token - Smart Outpass',
                resetUrl
            });

            res.status(200).json({ success: true, message: "Email sent successfully" });
        } catch (error) {
            // Rollback if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
export const resetPassword = async (req, res) => {
    const { password, role } = req.body;
    const { resetToken } = req.params;

    try {
        // 1. Hash the token from URL to compare with DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        let user;
        const queryzk = {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } // Check expiry
        };

        if (role === 'student') {
            user = await Student.findOne(queryzk);
        } else if (role === 'warden') {
            user = await Warden.findOne(queryzk);
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid or Expired Token" });
        }

        // 2. Set new password
        user.password = password; // Pre-save hook in model will hash this
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};