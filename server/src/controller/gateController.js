import Student from "../models/studentModel.js";
import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import GateLog from "../models/gateLogModel.js";
import Defaulter from "../models/defaulterModel.js";
import Security from "../models/securityModel.js";
import sendEmail from "../utils/sendEmail.js"; // Import Email Utility
import { mongoose } from 'mongoose';
// @desc    Verify Student & Log Entry/Exit
// @route   POST /api/gate/verify
// @desc    Verify Student & Log Entry/Exit (Smart QR Handling)
export const verifyAndLog = async (req, res) => {
  try {
    let { regNo, scanType } = req.body; 
    const guardId = req.user._id;
    const gateLocation = req.user.gateLocation || "Main Gate";

    // ============================================================
    // STEP 1: PARSE INPUT (Handle Raw QR JSON)
    // ============================================================
    // If the scanner sends the whole JSON string like: {"id":"694...", "regNo":"S20..."}
    // We need to extract the 'id' field from it.

    if (regNo && regNo.trim().startsWith('{')) {
        try {
            const parsedData = JSON.parse(regNo);
            if (parsedData.id) {
                regNo = parsedData.id; // Switch to using the ID from the JSON
            }
        } catch (e) {
            console.log("Input was not valid JSON, proceeding as string");
        }
    }

    // ============================================================
    // STEP 2: STRICT ID VALIDATION
    // ============================================================
    
    // Now check if we have a valid MongoDB ID (Pass ID)
    if (!mongoose.Types.ObjectId.isValid(regNo)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Pass ID. Please scan a valid Pass QR Code." 
        });
    }

    // ============================================================
    // STEP 3: FIND PASS & STUDENT
    // ============================================================

    let pass = await DayPass.findById(regNo).populate('studentId') 
            || await HomePass.findById(regNo).populate('studentId');

    if (!pass || !pass.studentId) {
        return res.status(404).json({ success: false, message: "Pass Not Found in Database" });
    }

    const student = pass.studentId;

    // ============================================================
    // STEP 4: CHECK OUT LOGIC
    // ============================================================

    if (scanType === 'CHECK_OUT') {
        
        if (pass.status === 'APPROVED') {
            
            // --- CHECK: Is student ALREADY OUT on ANY pass? ---
            const isAlreadyOut = await DayPass.exists({ studentId: student._id, status: 'CURRENTLY_OUT' }) 
                              || await HomePass.exists({ studentId: student._id, status: 'CURRENTLY_OUT' });

            if (isAlreadyOut) {
                return res.status(400).json({ 
                    success: false, 
                    message: "DENIED: Student is already OUT on another pass.",
                    student
                });
            }

            // Process Exit
            pass.actualOutTime = new Date();
            pass.status = 'CURRENTLY_OUT'; 
            await pass.save();
            
            await createLog(pass, student, guardId, scanType, gateLocation, "Allowed to Exit");
            
            await sendEmail({
                email: student.parentEmail || student.email,
                type: 'MOVEMENT_ALERT',
                name: student.parentName || "Parent",
                studentName: student.name,
                subject: `Gate Exit Alert: ${student.name}`,
                movementDetails: {
                    status: 'CHECKED OUT',
                    time: new Date().toLocaleString(),
                    gate: gateLocation
                }
            });

            return sendSuccess(res, "Allowed to Exit", student, pass, scanType);
        }

        if (pass.status === 'CURRENTLY_OUT') {
            return res.status(400).json({ success: false, message: "Student is already OUT", student });
        }

        if (pass.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Pass already USED/COMPLETED", student });
        }

        return res.status(400).json({ success: false, message: `Invalid Status: ${pass.status}`, student });
    } 

    // ============================================================
    // STEP 5: CHECK IN LOGIC
    // ============================================================

    else if (scanType === 'CHECK_IN') {

        let comment = "Returned";
        let isLate = false;

        if (pass.status === 'CURRENTLY_OUT') {
            // Proceed
        }
        else if (pass.status === 'APPROVED') {
            pass.actualOutTime = pass.actualOutTime || new Date(); 
            comment = "Flagged: Missed Exit Scan"; 
        }
        else if (pass.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Pass already USED (Student already IN)", student });
        }
        else {
             return res.status(400).json({ success: false, message: `Invalid Status: ${pass.status}`, student });
        }

        // --- Completion Logic ---
        pass.actualInTime = new Date();
        pass.status = 'COMPLETED'; 

        const deadline = pass.expectedIn || pass.toDate; 
        if (new Date() > new Date(deadline)) {
            isLate = true;
            pass.isLate = true;
            comment = comment === "Returned" ? "Late Entry" : `${comment} & Late`;
            
            student.isDefaulter = true;
            await student.save();
            
            await Defaulter.create({
                studentId: student._id, 
                passId: pass._id, 
                reason: "Late Return", 
                isActive: true
            });
        }

        await pass.save();
        await createLog(pass, student, guardId, scanType, gateLocation, comment);

        await sendEmail({
            email: student.parentEmail || student.email,
            type: 'MOVEMENT_ALERT',
            name: student.parentName || "Parent",
            studentName: student.name,
            subject: isLate ? `LATE RETURN ALERT: ${student.name}` : `Gate Entry Alert: ${student.name}`,
            movementDetails: {
                status: 'CHECKED IN', 
                time: new Date().toLocaleString(),
                gate: gateLocation
            }
        });
        
        return sendSuccess(res, isLate ? "LATE ENTRY DETECTED" : "Welcome Back", student, pass, scanType, isLate);
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// --- Helper Functions ---

async function createLog(pass, student, guardId, scanType, gateLocation, comment) {
    await GateLog.create({
        passId: pass._id,
        studentId: student._id,
        guardId,
        scanType,
        gateLocation,
        comment
    });
}

function sendSuccess(res, message, student, pass, scanType, isLate = false) {
    res.json({
        success: true,
        message,
        data: {
            studentName: student.name,
            regNo: student.regNo,
            scanType,
            isLate,
            passType: pass.expectedIn ? "Day Pass" : "Home Pass"
        }
    });
}

// @desc    Update Guard Personal Details
// @route   PUT /api/gate/profile
// @access  Private (Security)
export const updateGuardProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const guardId = req.user._id;

    const guard = await Security.findById(guardId);

    if (!guard) {
      return res.status(404).json({ success: false, message: "Guard not found" });
    }

    // Update allowed fields
    if (name) guard.name = name;
    if (email) guard.email = email;
    if (phone) guard.phone = phone;

    await guard.save();

    res.json({ 
        success: true, 
        message: "Profile updated successfully",
        data: {
            name: guard.name,
            email: guard.email,
            phone: guard.phone
        }
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Guard Password
// @route   PUT /api/gate/profile/password
// @access  Private (Security)
export const updateGuardPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const guardId = req.user._id;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const guard = await Security.findById(guardId);

    if (!guard) {
      return res.status(404).json({ success: false, message: "Guard not found" });
    }

    // The pre('save') hook in securityModel.js will handle hashing
    guard.password = newPassword;
    await guard.save();

    res.json({ success: true, message: "Password changed successfully" });

  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... existing imports ...

// @desc    Get Filtered Logs
// @route   GET /api/gate/logs
export const getGateLogs = async (req, res) => {
  try {
    const { type, date, search } = req.query;
    const query = {};

    // 1. Filters
    if (type) query.scanType = type;
    
    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.timestamp = { $gte: start, $lte: end };
    }

    // 2. Search (Requires populating student first, but simple regex on populated fields is hard in Mongo standard queries)
    // For simplicity, we assume search is handled on frontend or basic regex on Pass ID if added. 
    // To search student Name/RegNo properly, use aggregate pipeline.
    // HERE: We return recently logs, max 50 for performance.
    
    const logs = await GateLog.find(query)
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('studentId', 'name regNo')
        .populate('guardId', 'name');

    // Simple In-Memory Filtering for Search (for small datasets)
    let finalLogs = logs;
    if (search) {
        const lowerSearch = search.toLowerCase();
        finalLogs = logs.filter(log => 
            log.studentId?.name.toLowerCase().includes(lowerSearch) || 
            log.studentId?.regNo.toLowerCase().includes(lowerSearch)
        );
    }

    res.json({ success: true, data: finalLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Guard Profile
// @route   GET /api/gate/profile
export const getGuardProfile = async (req, res) => {
    try {
        const guard = await Security.findById(req.user._id).select('-password');
        res.json({ success: true, data: guard });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/gate/dashboard
// @access  Private (Security)
export const getGateDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. Stats
    const totalScanned = await GateLog.countDocuments({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    const currentlyOut = await GateLog.countDocuments({
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        scanType: 'CHECK_OUT'
    });

    // 2. Recent Logs
    const recentLogs = await GateLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('studentId', 'name regNo');

    res.json({
        success: true,
        data: {
            stats: { totalScanned, currentlyOut, alerts: 0 },
            recentLogs
        }
    });
  } catch (error) {
    console.error("Gate Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
