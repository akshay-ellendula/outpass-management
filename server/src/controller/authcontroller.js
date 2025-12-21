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

    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/* =====================================================
   4. FORGOT / RESET PASSWORD
===================================================== */

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email, role } = req.body;

    try {
        let user;

        if (role === 'student') {
            user = await Student.findOne({ email });
        } else if (role === 'warden') {
            user = await Warden.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                name: user.name,
                subject: 'Password Reset - Smart Outpass',
                resetUrl
            });

            res.status(200).json({
                success: true,
                message: 'Reset email sent'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { password, role } = req.body;
    const { resetToken } = req.params;

    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        let user;

        const query = {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        };

        if (role === 'student') {
            user = await Student.findOne(query);
        } else if (role === 'warden') {
            user = await Warden.findOne(query);
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
