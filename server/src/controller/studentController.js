import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import Student from "../models/studentModel.js";
import SystemConfig from "../models/systemConfigModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';
import ProfileUpdateRequest from "../models/profileUpdateRequestModel.js";

// ... existing imports

// @desc    Update Student Password
// @route   PUT /api/student/profile/password
// @access  Private (Student)
export const updateStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const studentId = req.user._id;

    // 1. Basic Validation
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 6 characters long" 
        });
    }

    // 2. Find Student
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 3. Update Password
    // The pre('save') hook in studentModel.js will automatically hash this
    student.password = newPassword;
    await student.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// @desc    Request Profile Update
// @route   POST /api/student/profile/update-request
// @access  Private (Student)
export const requestProfileUpdate = async (req, res) => {
  try {
    const studentId = req.user._id;
    const updates = req.body;

    // 1. Check for existing pending request
    const existingRequest = await ProfileUpdateRequest.findOne({ 
        studentId, 
        status: 'PENDING' 
    });

    if (existingRequest) {
        return res.status(400).json({ 
            success: false, 
            message: "You already have a pending update request. Please wait for approval." 
        });
    }

    // 2. Define Allowed Fields
    const allowedFields = [
        'name', 'phone', 'email', 
        'parentName', 'parentPhone', 'parentEmail', 
        'roomNo', 'hostelBlock'
    ];

    // 3. Filter Updates (Remove disallowed or empty fields)
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] && updates[key] !== req.user[key]) {
            filteredUpdates[key] = updates[key];
        }
    });

    if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ success: false, message: "No changes detected." });
    }

    // 4. Create Request
    await ProfileUpdateRequest.create({
        studentId,
        updates: filteredUpdates,
        status: 'PENDING'
    });

    res.status(201).json({ success: true, message: "Update request submitted successfully." });

  } catch (error) {
    console.error("Profile Request Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Pass Details (Day or Home)
// @route   GET /api/student/pass/:id?type=...
// @access  Private (Student)
export const getPassDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'Day Pass' or 'Home Pass'

    if (!id || !type) {
      return res.status(400).json({ success: false, message: "Missing Pass ID or Type" });
    }

    let pass;

    // 1. Fetch based on Type
    if (type === 'Day Pass') {
      pass = await DayPass.findById(id)
        .populate('studentId', 'name regNo email phone hostelBlock roomNo');
    } else if (type === 'Home Pass') {
      pass = await HomePass.findById(id)
        .populate('studentId', 'name regNo email phone hostelBlock roomNo');
    } else {
      return res.status(400).json({ success: false, message: "Invalid Pass Type" });
    }

    // 2. Check if Pass exists
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass request not found" });
    }

    // 3. Security Check: Ensure the logged-in student owns this pass
    if (pass.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this pass" });
    }

    res.json({ success: true, data: pass });

  } catch (error) {
    console.error("Fetch Pass Details Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Pass Details by Token (Public)
// @route   GET /api/student/public/pass/:token
// @access  Public
export const getPassByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the raw token from URL to match DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const pass = await HomePass.findOne({ 
        guardianApprovalToken: hashedToken,
        status: 'PENDING_GUARDIAN' // Only show if pending
    }).populate("studentId", "name regNo phone");

    if (!pass) {
        return res.status(400).json({ success: false, message: "Invalid or expired link." });
    }

    res.json({ success: true, data: pass });
  } catch (error) {
    console.error("Token Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Guardian Action (Approve/Reject)
// @route   POST /api/student/public/pass/:token/action
// @access  Public
export const guardianPassAction = async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const pass = await HomePass.findOne({ 
        guardianApprovalToken: hashedToken,
        status: 'PENDING_GUARDIAN'
    });

    if (!pass) {
        return res.status(400).json({ success: false, message: "Invalid or expired link." });
    }

    if (action === 'APPROVE') {
        // Fetch config to check for Auto-Approval
        const config = await SystemConfig.findOne();
        
        pass.isGuardianApproved = true;
        // If Auto-Approve is ON, skip Warden; else go to Warden
        pass.status = config?.homePassAutoApprove ? 'APPROVED' : 'PENDING_WARDEN';
        
        // If approved immediately, generate QR
        if (pass.status === 'APPROVED') {
            pass.generateQR();
        }

        pass.guardianApprovalToken = undefined; // Consume token
        await pass.save();

        res.json({ success: true, message: "Request Approved Successfully!" });

    } else if (action === 'REJECT') {
        pass.status = 'REJECTED';
        pass.rejectionReason = "Rejected by Guardian";
        pass.guardianApprovalToken = undefined; // Consume token
        await pass.save();

        res.json({ success: true, message: "Request Rejected." });
    } else {
        res.status(400).json({ success: false, message: "Invalid Action" });
    }

  } catch (error) {
    console.error("Guardian Action Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Student Dashboard Stats & Recent Activity
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Fetch Day Passes
        const dayPasses = await DayPass.find({ studentId }).sort({ createdAt: -1 });

        // 2. Fetch Home Passes
        const homePasses = await HomePass.find({ studentId }).sort({ createdAt: -1 });

        // 3. Combine and sort all requests
        const allRequests = [
            ...dayPasses.map(p => ({
                _id: p._id,
                type: "Day Pass",
                reason: p.reason,
                status: p.status,
                createdAt: p.createdAt,
                outTime: p.expectedOut,
                inTime: p.expectedIn
            })),
            ...homePasses.map(p => ({
                _id: p._id,
                type: "Home Pass",
                reason: p.reason,
                status: p.status, // Can be PENDING_GUARDIAN, PENDING_WARDEN, APPROVED, etc.
                createdAt: p.createdAt,
                outTime: p.fromDate,
                inTime: p.toDate
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 4. Calculate Stats
        const total = allRequests.length;

        const pending = allRequests.filter(r =>
            ["PENDING", "PENDING_GUARDIAN", "PENDING_WARDEN"].includes(r.status)
        ).length;

        const approved = allRequests.filter(r => r.status === "APPROVED").length;
        const rejected = allRequests.filter(r => r.status === "REJECTED").length;

        res.json({
            success: true,
            data: {
                stats: { total, pending, approved, rejected },
                recentActivity: allRequests.slice(0, 10) // Limit to top 10 for dashboard
            }
        });

    } catch (error) {
        console.error("Student Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Current Student Profile
// @route   GET /api/student/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const student = await Student.findById(req.user._id).select("-password");

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const applyDayPass = async (req, res) => {
    try {
        const { date, outTime, inTime, destination, reason } = req.body;
        const student = req.user;

        // 1. Check if Defaulter
        if (student.isDefaulter) {
            return res.status(403).json({ success: false, message: "You are blocked from applying passes due to Defaulter status." });
        }

        // 2. Fetch System Config
        let config = await SystemConfig.findOne();
        if (!config) config = await SystemConfig.create({}); 

        if (config.emergencyFreeze) {
            return res.status(503).json({ success: false, message: "System is currently frozen. No new passes allowed." });
        }

        // 3. Time Validation
        if (outTime < config.dayPassStartTime || inTime > config.dayPassEndTime) {
            return res.status(400).json({
                success: false,
                message: `Timing allowed: ${config.dayPassStartTime} to ${config.dayPassEndTime}`
            });
        }

        // 4. Check for existing active passes on that date
        const existingPass = await DayPass.findOne({
            studentId: student._id,
            date: new Date(date),
            status: { $in: ['PENDING', 'APPROVED'] }
        });

        if (existingPass) {
            return res.status(400).json({ success: false, message: "You already have a pass request for this date." });
        }

        // 5. Create Pass
        const status = config.dayPassAutoApprove ? 'APPROVED' : 'PENDING';

        const dayPass = new DayPass({
            studentId: student._id,
            date,
            expectedOut: new Date(`${date}T${outTime}`),
            expectedIn: new Date(`${date}T${inTime}`),
            reason: `${reason} (Dest: ${destination})`,
            status
        });

        if (status === 'APPROVED') {
            dayPass.generateQR();
        }

        await dayPass.save();

        // 6. Send Email Notification to PARENT
        if (student.parentEmail) {
            try {
                await sendEmail({
                    email: student.parentEmail, // <--- Send to Parent
                    subject: `Day Pass Request: ${student.name}`,
                    type: 'DAY_PASS_PARENT_NOTIFY', // <--- New Template Type
                    name: student.parentName || "Guardian",
                    studentName: student.name,
                    passDetails: {
                        date: new Date(date).toDateString(),
                        outTime: outTime,
                        inTime: inTime,
                        destination: destination,
                        status: status
                    }
                });
            } catch (emailError) {
                console.error("Failed to send Day Pass email to parent:", emailError);
            }
        }

        res.status(201).json({ success: true, message: "Day Pass applied successfully!", data: dayPass });

    } catch (error) {
        console.error("Apply Day Pass Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Apply for Home Pass
// @route   POST /api/student/apply/home
// @access  Private (Student)
export const applyHomePass = async (req, res) => {
    try {
        const { fromDate, fromTime, toDate, toTime, destination, reason } = req.body;
        const student = req.user;

        // 1. Defaulter Check
        if (student.isDefaulter) {
            return res.status(403).json({ success: false, message: "Blocked: Defaulter Status Active" });
        }

        // 2. System Freeze Check
        const config = await SystemConfig.findOne();
        if (config?.emergencyFreeze) {
            return res.status(503).json({ success: false, message: "System Frozen" });
        }

        // 3. Create Home Pass
        const homePass = new HomePass({
            studentId: student._id,
            fromDate: new Date(`${fromDate}T${fromTime}`),
            toDate: new Date(`${toDate}T${toTime}`),
            reason: `${reason} (Dest: ${destination})`,
            status: 'PENDING_GUARDIAN',
            isGuardianApproved: false
        });

        // 4. Generate Token & Send Email
        const token = homePass.getGuardianToken();
        await homePass.save();

        const approvalLink = `http://localhost:5173/guardian/approve/${token}`; // Frontend Route

        try {
            await sendEmail({
                email: student.parentEmail,
                name: student.parentName,
                subject: `Action Required: Home Pass for ${student.name}`,
                type: 'PASS_APPROVAL', // Trigger the approval template
                studentName: student.name,
                passDetails: {
                    reason: reason,
                    fromDate: `${fromDate} at ${fromTime}`,
                    toDate: `${toDate} at ${toTime}`
                },
                actionUrl: approvalLink
            });

            res.status(201).json({
                success: true,
                message: "Application submitted. Approval email sent to guardian."
            });

        } catch (emailError) {
            await homePass.deleteOne(); // Rollback
            return res.status(500).json({ success: false, message: "Failed to send email. Please try again." });
        }

    } catch (error) {
        console.error("Apply Home Pass Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};