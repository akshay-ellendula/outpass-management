import Student from "../models/studentModel.js";
import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import GateLog from "../models/gateLogModel.js";
import Defaulter from "../models/defaulterModel.js";
import Security from "../models/securityModel.js";
import sendEmail from "../utils/sendEmail.js"; // Import Email Utility

// @desc    Verify Student & Log Entry/Exit
// @route   POST /api/gate/verify
export const verifyAndLog = async (req, res) => {
  try {
    const { regNo, scanType } = req.body; // 'regNo' can be Student ID OR QR Code hash
    const guardId = req.user._id;
    const gateLocation = req.user.gateLocation || "Main Gate";

    let student = null;
    let pass = null;

    // ============================================================
    // STEP 1: IDENTIFY STUDENT & FIND PASS
    // ============================================================
    
    // A. Try finding by Registration Number (Manual Input)
    student = await Student.findOne({ regNo: regNo.toUpperCase() });

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    // We look for any relevant status. 
    // We explicitly exclude REJECTED/CANCELLED to avoid finding dead passes.
    const validStatuses = ['APPROVED', 'CURRENTLY_OUT', 'COMPLETED'];

    if (student) {
        // If student found, find their LATEST relevant pass for today
        // FIX: Added .sort({ createdAt: -1 }) to get the NEWEST pass first
        // FIX: Added .sort({ updatedAt: -1 }) as secondary sort to get most recently modified
        pass = await DayPass.findOne({ 
            studentId: student._id,
            status: { $in: validStatuses }, 
            date: { $gte: todayStart }
        }).sort({ createdAt: -1, updatedAt: -1 }) 
        || await HomePass.findOne({
            studentId: student._id,
            status: { $in: validStatuses },
            fromDate: { $lte: new Date() },
            toDate: { $gte: todayStart }
        }).sort({ createdAt: -1, updatedAt: -1 });
    } 
    else {
        // B. Try finding directly by QR Code (Scanner Input)
        // Note: QR codes are unique to a specific pass, so sort isn't strictly needed here, 
        // but good for consistency.
        pass = await DayPass.findOne({ qrCode: regNo }).populate('studentId') 
            || await HomePass.findOne({ qrCode: regNo }).populate('studentId');

        if (pass) {
            student = pass.studentId;
        }
    }

    // ============================================================
    // STEP 2: VALIDATE PASS EXISTENCE
    // ============================================================

    if (!student || !pass) {
        // Optional: Log generic denial if student exists but no pass
        if(student) {
             await GateLog.create({
                passId: null,
                studentId: student._id,
                guardId,
                scanType: 'DENIED',
                gateLocation,
                comment: 'No valid pass found'
            });
        }
        return res.status(404).json({ success: false, message: "Invalid QR or No Active Pass Found" });
    }

    // ============================================================
    // STEP 3: STATUS CHECKS & LOGIC
    // ============================================================

    // 1. Defaulter Check (Block Exit Only)
    if (student.isDefaulter && scanType === 'CHECK_OUT') {
        await GateLog.create({
            passId: pass._id,
            studentId: student._id,
            guardId,
            scanType: 'DENIED',
            gateLocation,
            comment: 'Blocked: Student is Defaulter'
        });
        return res.status(403).json({ 
            success: false, 
            message: "BLOCK: Student is a Defaulter.", 
            student 
        });
    }

    let message = "Scan Successful";
    let isLate = false;
    let comment = 'Standard';
    let shouldSendEmail = false;
    let emailScanStatus = "";

    // --- CHECK OUT LOGIC ---
    if (scanType === 'CHECK_OUT') {
        
        // Critical Status Checks
        if (pass.status === 'CURRENTLY_OUT') {
            return res.status(400).json({ success: false, message: "Student is already OUT", student });
        }
        if (pass.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Pass already USED/COMPLETED", student });
        }
        if (pass.status !== 'APPROVED') {
             return res.status(400).json({ success: false, message: `Pass status is ${pass.status}`, student });
        }

        // Apply Update
        pass.actualOutTime = new Date();
        pass.status = 'CURRENTLY_OUT';
        message = "Allowed to Exit";
        
        shouldSendEmail = true;
        emailScanStatus = "CHECKED OUT";
    } 
    
    // --- CHECK IN LOGIC ---
    else if (scanType === 'CHECK_IN') {

        if (pass.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Student already IN (Pass Completed)", student });
        }

        // Handle "Missed Exit Scan" (Student is APPROVED but scanning IN)
        if (pass.status === 'APPROVED') {
            pass.actualOutTime = pass.actualOutTime || new Date(); 
            comment = "Flagged: Missed Exit Scan"; 
        }

        // Apply Update
        pass.actualInTime = new Date();
        pass.status = 'COMPLETED';
        
        shouldSendEmail = true;
        emailScanStatus = "CHECKED IN";

        // Late Detection
        const deadline = pass.expectedIn || pass.toDate; 
        if (new Date() > new Date(deadline)) {
            isLate = true;
            pass.isLate = true;
            comment = comment === 'Standard' ? 'Late Entry' : `${comment} & Late`;
            message = "LATE ENTRY DETECTED";

            // Mark Defaulter
            student.isDefaulter = true;
            await student.save();

            const existingDefaulter = await Defaulter.findOne({ passId: pass._id });
            if (!existingDefaulter) {
                await Defaulter.create({
                    studentId: student._id,
                    passId: pass._id,
                    reason: `Late Return. Deadline: ${new Date(deadline).toLocaleString()}`,
                    isActive: true
                });
            }
        } else {
            message = comment.includes('Missed') ? "Allowed (Missed Exit Detected)" : "Welcome Back";
        }
    }

    // ============================================================
    // STEP 4: SAVE & NOTIFY
    // ============================================================

    await pass.save();

    await GateLog.create({
        passId: pass._id,
        studentId: student._id,
        guardId,
        scanType,
        gateLocation,
        comment
    });

    if (shouldSendEmail) {
        const targetEmail = student.parentEmail || student.email;
        if (targetEmail) {
            sendEmail({
                email: targetEmail,
                subject: `Movement Alert: ${student.name}`,
                type: 'MOVEMENT_ALERT',
                name: student.parentName || "Guardian",
                studentName: student.name,
                movementDetails: {
                    status: emailScanStatus,
                    time: new Date().toLocaleString(),
                    gate: gateLocation
                }
            }).catch(e => console.error("Email fail", e.message));
        }
    }

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

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


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
