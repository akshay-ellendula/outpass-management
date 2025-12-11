import jwt from 'jsonwebtoken';
import Warden from '../models/wardenModel.js';
import Security from '../models/securityModel.js';
import Admin from '../models/adminModel.js';
import Student from '../models/studentModel.js';

// --- STUDENT AUTH ---

// @desc    Signup for Student
// @route   POST /api/auth/studentSignup
export const studentSignup = async (req, res) => {
    const { regNo, name, email, password, phone, hostelBlock, roomNo, parentName, parentEmail, parentPhone } = req.body;

    try {
        // 1. Validate Required Fields
        if (!regNo || !name || !email || !password || !hostelBlock || !parentEmail) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        // 2. Check for Existing User
        const existingStudent = await Student.findOne({ regNo });
        if (existingStudent) {
            return res.status(409).json({ message: "Student with this RegNo already exists" });
        }

        // 3. Create Student
        const student = await Student.create({
            regNo, name, email, password, phone,
            hostelBlock, roomNo, parentName, parentEmail, parentPhone,
            role: 'student'
        });

        // 4. Generate Token & Cookie
        generateTokenAndCookie(res, student._id, 'student');

        res.status(201).json({
            success: true,
            user: {
                id: student._id,
                name: student.name,
                regNo: student.regNo,
                email: student.email,
                role: 'student'
            }
        });
    } catch (error) {
        console.error("Student Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// @desc    Signin for Student
// @route   POST /api/auth/studentSignin
export const studentSignin = async (req, res) => {
    const { regNo, password } = req.body;

    try {
        if (!regNo || !password) {
            return res.status(400).json({ message: "RegNo and Password are required" });
        }

        const student = await Student.findOne({ regNo });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const isMatch = await student.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateTokenAndCookie(res, student._id, 'student');

        res.status(200).json({
            success: true,
            user: {
                id: student._id,
                name: student.name,
                regNo: student.regNo,
                role: 'student'
            }
        });
    } catch (error) {
        console.error("Student Signin Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// --- WARDEN AUTH ---

// @desc    Signup for Warden
// @route   POST /api/auth/wardenSignup
export const wardenSignup = async (req, res) => {
    const { empId, name, email, password, phone, assignedBlock } = req.body;

    try {
        if (!empId || !name || !email || !password || !assignedBlock) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingWarden = await Warden.findOne({ empId });
        if (existingWarden) {
            return res.status(409).json({ message: "Warden with this EmpID already exists" });
        }

        const warden = await Warden.create({
            empId, name, email, password, phone,
            assignedBlock,
            role: 'warden'
        });

        generateTokenAndCookie(res, warden._id, 'warden');

        res.status(201).json({ success: true, user: { id: warden._id, name: warden.name, role: 'warden' } });

    } catch (error) {
        console.error("Warden Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// @desc    Signin for Warden
// @route   POST /api/auth/wardenSignin
export const wardenSignin = async (req, res) => {
    const { empId, password } = req.body;

    try {
        if (!empId || !password) return res.status(400).json({ message: "Fields required" });

        const warden = await Warden.findOne({ empId });
        if (!warden) return res.status(404).json({ message: "Warden not found" });

        const isMatch = await warden.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        generateTokenAndCookie(res, warden._id, 'warden');

        res.status(200).json({ success: true, user: { id: warden._id, name: warden.name, role: 'warden' } });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- SECURITY AUTH ---

// @desc    Signup for Security
// @route   POST /api/auth/securitySignup
export const securitySignup = async (req, res) => {
    const { guardId, name, password, gateLocation } = req.body;

    try {
        if (!guardId || !password || !gateLocation) return res.status(400).json({ message: "Fields required" });

        const existingGuard = await Security.findOne({ guardId });
        if (existingGuard) return res.status(409).json({ message: "Guard ID exists" });

        const security = await Security.create({
            guardId, name, password, gateLocation, role: 'security'
        });

        generateTokenAndCookie(res, security._id, 'security');
        res.status(201).json({ success: true, user: { id: security._id, role: 'security' } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Signin for Security
// @route   POST /api/auth/securitySignin
export const securitySignin = async (req, res) => {
    const { guardId, password } = req.body;

    try {
        const security = await Security.findOne({ guardId });
        if (!security) return res.status(404).json({ message: "Guard not found" });

        const isMatch = await security.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        generateTokenAndCookie(res, security._id, 'security');
        res.status(200).json({ success: true, user: { id: security._id, role: 'security' } });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// --- ADMIN AUTH ---

// @desc    Signin for Admin
// @route   POST /api/auth/adminSignin
export const adminSignin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        generateTokenAndCookie(res, admin._id, 'admin');
        res.status(200).json({ success: true, user: { id: admin._id, role: 'admin' } });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Admin Signup (Optional, usually pre-seeded)
export const adminSignup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existing = await Admin.findOne({ username });
        if(existing) return res.status(400).json({message: "Admin exists"});
        
        const admin = await Admin.create({ username, password });
        generateTokenAndCookie(res, admin._id, 'admin');
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- COMMON FUNCTIONS ---

// @desc    Verify Auth Status (Loads user data on refresh)
// @route   GET /api/auth/verify
export const verifyAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(200).json({ authenticated: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        let user;

        if (decoded.role === 'student') {
            user = await Student.findById(decoded.id).select('-password');
        } else if (decoded.role === 'warden') {
            user = await Warden.findById(decoded.id).select('-password');
        } else if (decoded.role === 'security') {
            user = await Security.findById(decoded.id).select('-password');
        } else if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id).select('-password');
        }

        if (!user) {
            res.clearCookie("jwt");
            return res.status(200).json({ authenticated: false });
        }

        res.status(200).json({ authenticated: true, user });
    } catch (error) {
        res.clearCookie("jwt");
        res.status(200).json({ authenticated: false });
    }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
};

// Helper Function
const generateTokenAndCookie = (res, userId, role) => {
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d'
    });

    res.cookie('jwt', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production'
    });
};