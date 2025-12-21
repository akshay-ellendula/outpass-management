import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import Warden from '../models/wardenModel.js';
import Security from '../models/securityModel.js';
import Admin from '../models/adminModel.js';
import Student from '../models/studentModel.js';

import sendEmail from '../utils/sendEmail.js';

/* =====================================================
   1. LOGIN CONTROLLERS
===================================================== */

// Student Signin
export const studentSignin = async (req, res) => {
    const { regNo, password } = req.body;

    try {
        const student = await Student.findOne({ regNo });

        if (!student || !(await student.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateTokenAndCookie(res, student._id, 'student');

        res.status(200).json({
            success: true,
            user: {
                id: student._id,
                name: student.name,
                role: 'student'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Warden Signin
export const wardenSignin = async (req, res) => {
    const { wardenId: empId, password } = req.body;

    try {
        const warden = await Warden.findOne({ empId });

        if (!warden || !(await warden.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateTokenAndCookie(res, warden._id, 'warden');

        res.status(200).json({
            success: true,
            user: {
                id: warden._id,
                name: warden.name,
                role: 'warden'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Security Signin
export const securitySignin = async (req, res) => {
    const { gateId: guardId, passcode: password } = req.body;
    try {
        const security = await Security.findOne({ guardId });
        

        if (!security || !(await security.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateTokenAndCookie(res, security._id, 'security');

        res.status(200).json({
            success: true,
            user: {
                id: security._id,
                role: 'security'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin Signin
export const adminSignin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateTokenAndCookie(res, admin._id, 'admin');

        res.status(200).json({
            success: true,
            user: {
                id: admin._id,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/* =====================================================
   2. ADMIN SETUP (RUN ONCE)
===================================================== */

export const adminSignup = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.create({ username, password });

        generateTokenAndCookie(res, admin._id, 'admin');

        res.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =====================================================
   3. AUTH UTILITIES
===================================================== */

// Logout
export const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

// Verify Auth
export const verifyAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(200).json({ authenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.status(200).json({
            authenticated: true,
            user: decoded
        });
    } catch (error) {
        res.status(200).json({ authenticated: false });
    }
};

// JWT Helper
export const generateTokenAndCookie = (res, userId, role) => {
    const token = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,              // REQUIRED on Vercel
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};


/* =====================================================
   4. FORGOT / RESET PASSWORD
===================================================== */

// ... existing imports

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  try {
    let user;

    // 1. Find user based on the selected role
    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'warden':
        user = await Warden.findOne({ email });
        break;
      case 'security':
        user = await Security.findOne({ email });
        break;
      case 'admin':
        // FIXED: Now searches by email instead of username
        user = await Admin.findOne({ email: email }); 
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role selected" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `No ${role} found with that email.` });
    }

    // 2. Generate Token
    const resetToken = user.getResetPasswordToken(); 
    await user.save({ validateBeforeSave: false });

    // 3. Send Email
    // Ensure frontend route is correct (e.g., /reset-password vs /reset)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      email: user.email, 
      subject: "Password Reset Request",
      type: "PASSWORD_RESET",
      name: user.name || user.username || role, // Fallback for Admin who might not have 'name'
      resetUrl: resetUrl
    });

    res.status(200).json({ success: true, message: "Email sent" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... existing resetPassword function (Logic is correct)

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
    try {
        // Hash the token from URL to match database
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Search in ALL collections for this token (Token is unique enough)
        let user = await Student.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) user = await Warden.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) user = await Security.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) user = await Admin.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Token" });
        }

        // Set new password
        user.password = req.body.password; // Pre-save hook will hash this
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
