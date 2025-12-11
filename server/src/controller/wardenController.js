import Security from '../models/securityModel.js';
import Student from '../models/studentModel.js';

// @desc    Create a new Student
// @route   POST /api/warden/create-student
// @access  Private (Warden only)
export const createStudent = async (req, res) => {
    const { 
        regNo, name, email, password, phone, 
        hostelBlock, roomNo, 
        parentName, parentEmail, parentPhone 
    } = req.body;

    try {
        // Check if student exists
        const exists = await Student.findOne({ regNo });
        if (exists) {
            return res.status(409).json({ message: "Student RegNo already exists" });
        }

        // Create Student
        const student = await Student.create({
            regNo, name, email, password, phone,
            hostelBlock, roomNo, parentName, parentEmail, parentPhone,
            role: 'student'
            
        });

        res.status(201).json({
            success: true,
            message: "Student profile created successfully",
            data: { regNo: student.regNo, name: student.name }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new Security Guard
// @route   POST /api/warden/create-security
// @access  Private (Warden only)
export const createSecurity = async (req, res) => {
    const { guardId, name, password, gateLocation } = req.body;

    try {
        const exists = await Security.findOne({ guardId });
        if (exists) {
            return res.status(409).json({ message: "Guard ID already exists" });
        }

        const security = await Security.create({
            guardId, name, password, gateLocation,
            role: 'security'
        });

        res.status(201).json({
            success: true,
            message: "Security profile created successfully",
            data: { guardId: security.guardId, location: security.gateLocation }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};