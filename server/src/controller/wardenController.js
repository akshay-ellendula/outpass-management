import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import Student from "../models/studentModel.js";
import Defaulter from "../models/defaulterModel.js";
import Warden from "../models/wardenModel.js";
import Security from "../models/securityModel.js";
import GateLog from "../models/gateLogModel.js";
import ProfileUpdateRequest from "../models/profileUpdateRequestModel.js";


// ... existing imports

// @desc    Get All Profile Update Requests (Warden)
// @route   GET /api/warden/profile-requests
// @access  Private (Warden)
export const getProfileUpdateRequests = async (req, res) => {
  try {
    // Fetch pending requests first
    const requests = await ProfileUpdateRequest.find({ status: "PENDING" })
        .populate("studentId", "name regNo hostelBlock roomNo phone email parentPhone parentEmail") // Get current data
        .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Fetch Profile Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Approve/Reject Profile Update
// @route   PUT /api/warden/profile-requests/:id
// @access  Private (Warden)
export const handleProfileUpdateAction = async (req, res) => {
  try {
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const request = await ProfileUpdateRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "PENDING") return res.status(400).json({ success: false, message: "Request already processed" });

    if (action === "APPROVE") {
        // 1. Update Student Profile
        const student = await Student.findById(request.studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Apply updates dynamically
        Object.keys(request.updates).forEach(key => {
            student[key] = request.updates[key];
        });

        await student.save();
        request.status = "APPROVED";
    } else {
        request.status = "REJECTED";
    }

    request.actionBy = req.user._id;
    request.actionDate = Date.now();
    await request.save();

    res.json({ success: true, message: `Request ${action.toLowerCase()}d successfully` });
  } catch (error) {
    console.error("Profile Action Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// ... existing imports
// @desc    Get Warden Dashboard Stats
// @route   GET /api/warden/dashboard-stats
// @access  Private (Warden)
export const getWardenDashboardStats = async (req, res) => {
  try {
    // Assuming req.user is populated (warden)
    const warden = req.user; 
    
    // Filter students by assigned block (if warden is assigned to specific block)
    // For now, fetching global stats for simplicity, or filter by 'hostelBlock'
    const blockFilter = { hostelBlock: warden.assignedBlock };

    // 1. Pending Requests (Day + Home)
    const pendingDay = await DayPass.countDocuments({ status: "PENDING" });
    const pendingHome = await HomePass.countDocuments({ status: "PENDING_WARDEN" });
    const pendingRequests = pendingDay + pendingHome;

    // 2. Students Currently OUT
    // Check DayPass (approved & out, not back)
    const dayOut = await DayPass.countDocuments({ 
      status: "APPROVED", 
      actualOutTime: { $ne: null }, 
      actualInTime: null 
    });
    // Check HomePass (approved & out, not back)
    const homeOut = await HomePass.countDocuments({ 
      status: "APPROVED", 
      actualOutTime: { $ne: null }, 
      actualInTime: null 
    });
    const studentsOut = dayOut + homeOut;

    // 3. Active Defaulters
    const activeDefaulters = await Defaulter.countDocuments({ isActive: true });

    // 4. Recent Movements (Combined Feed)
    // Fetch last 5 updates from both collections
    const recentDay = await DayPass.find()
        .populate("studentId", "name regNo hostelBlock")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();
    
    const recentHome = await HomePass.find()
        .populate("studentId", "name regNo hostelBlock")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

    // Combine and sort
    const recentMovements = [...recentDay, ...recentHome]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
        .map(pass => ({
            _id: pass._id,
            studentName: pass.studentId?.name || "Unknown",
            regNo: pass.studentId?.regNo || "N/A",
            type: pass.fromDate ? "Home Pass" : "Day Pass", // Distinguish by field
            exitTime: pass.actualOutTime || pass.expectedOut || pass.fromDate,
            returnTime: pass.actualInTime || pass.expectedIn || pass.toDate,
            status: pass.status,
            isOut: !!(pass.actualOutTime && !pass.actualInTime)
        }));

    res.json({
      success: true,
      data: {
        pendingRequests,
        studentsOut,
        activeDefaulters, // Or editRequests count if you have that logic
        recentMovements
      },
    });
  } catch (error) {
    console.error("Warden Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

;

// ... (Existing dashboard stats function)

// @desc    Get All Pending Pass Requests
// @route   GET /api/warden/pass-requests
// @access  Private (Warden)
export const getPendingPassRequests = async (req, res) => {
  try {
    // 1. Fetch Day Passes (Status: PENDING)
    const dayPasses = await DayPass.find({ status: "PENDING" })
      .populate("studentId", "name regNo hostelBlock roomNo")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch Home Passes (Status: PENDING_WARDEN)
    // Note: Home passes must be approved by guardian first
    const homePasses = await HomePass.find({ status: "PENDING_WARDEN" })
      .populate("studentId", "name regNo hostelBlock roomNo")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Format & Combine
    const formattedRequests = [
      ...dayPasses.map(pass => ({
        _id: pass._id,
        type: "Day Pass",
        studentName: pass.studentId?.name,
        regNo: pass.studentId?.regNo,
        hostelInfo: `${pass.studentId?.hostelBlock} - Room ${pass.studentId?.roomNo}`,
        timeOut: pass.expectedOut,
        timeIn: pass.expectedIn,
        reason: pass.reason,
        createdAt: pass.createdAt
      })),
      ...homePasses.map(pass => ({
        _id: pass._id,
        type: "Home Pass",
        studentName: pass.studentId?.name,
        regNo: pass.studentId?.regNo,
        hostelInfo: `${pass.studentId?.hostelBlock} - Room ${pass.studentId?.roomNo}`,
        timeOut: pass.fromDate,
        timeIn: pass.toDate,
        reason: pass.reason,
        createdAt: pass.createdAt
      }))
    ];

    // Sort combined list by creation date
    formattedRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error("Fetch Pending Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Approve or Reject Pass
// @route   PUT /api/warden/pass-requests/:id
// @access  Private (Warden)
export const handlePassAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, type } = req.body; // action: 'APPROVE' | 'REJECT', type: 'Day Pass' | 'Home Pass'

    if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ success: false, message: "Invalid action" });
    }

    let pass;
    if (type === "Day Pass") {
        pass = await DayPass.findById(id);
    } else {
        pass = await HomePass.findById(id);
    }

    if (!pass) {
        return res.status(404).json({ success: false, message: "Pass request not found" });
    }

    // Update Status
    if (action === 'APPROVE') {
        pass.status = 'APPROVED';
        pass.approvedBy = req.user._id;
        
        // Generate QR Code (using method from model)
        // Ensure you have `pass.generateQR()` defined in your models
        if (pass.generateQR) {
            pass.generateQR(); 
        }
    } else {
        pass.status = 'REJECTED';
        // Optional: Add rejection reason
    }

    await pass.save();

    res.json({ success: true, message: `Pass ${action.toLowerCase()}d successfully` });
  } catch (error) {
    console.error("Pass Action Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// @desc    Get Students (Filtered by Warden's Block)
// @route   GET /api/warden/students
// @access  Private (Warden)
export const getMyStudents = async (req, res) => {
  try {
    // 1. Get Warden's Assigned Block
    // req.user is populated by authMiddleware
    const warden = await Warden.findById(req.user._id);
    
    if (!warden) {
        return res.status(404).json({ success: false, message: "Warden profile not found" });
    }

    const assignedBlock = warden.assignedBlock;

    // 2. Fetch Students matching that block
    const students = await Student.find({ hostelBlock: assignedBlock })
        .select("-password")
        .sort({ name: 1 });

    res.json({ success: true, data: students, block: assignedBlock });
  } catch (error) {
    console.error("Fetch Students Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// @desc    Get Single Student Details (Warden)
// @route   GET /api/warden/students/:id
// @access  Private (Warden)
export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// @desc    Toggle Student Status (Deactivate/Activate)
// @route   PATCH /api/warden/students/:id/status
// @access  Private (Warden)
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    student.isActive = !student.isActive;
    await student.save();

    res.json({ 
        success: true, 
        message: `Student ${student.isActive ? "activated" : "deactivated"} successfully`,
        data: { isActive: student.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete Student
// @route   DELETE /api/warden/students/:id
// @access  Private (Warden)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    await student.deleteOne();
    res.json({ success: true, message: "Student record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Student Pass History
// @route   GET /api/warden/students/:id/history
// @access  Private (Warden)
export const getStudentHistory = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Fetch Day Passes
    const dayPasses = await DayPass.find({ studentId }).lean();
    // Fetch Home Passes
    const homePasses = await HomePass.find({ studentId }).lean();

    // Combine & Format
    const history = [
        ...dayPasses.map(p => ({
            _id: p._id,
            type: "Day Pass",
            destination: p.reason, // Using reason as destination for now
            outTime: p.actualOutTime,
            inTime: p.actualInTime,
            status: p.status,
            isLate: p.isLate,
            date: p.date
        })),
        ...homePasses.map(p => ({
            _id: p._id,
            type: "Home Pass",
            destination: p.reason,
            outTime: p.actualOutTime,
            inTime: p.actualInTime,
            status: p.status,
            isLate: p.isLate,
            date: p.fromDate
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... existing imports

// @desc    Add New Student (To Warden's Block)
// @route   POST /api/warden/students
// @access  Private (Warden)
export const addStudent = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);
    const { 
        regNo, name, email, phone, 
        roomNo, parentName, parentEmail, parentPhone,
        year, branch, password 
    } = req.body;

    const hostelBlock = warden.assignedBlock;

    const exists = await Student.findOne({ $or: [{ regNo }, { email }] });
    if (exists) {
        return res.status(400).json({ success: false, message: "Student already registered" });
    }

    const initialPassword = password || regNo; 

    const student = await Student.create({
        regNo,
        name,
        email,
        phone,
        password: initialPassword,
        hostelBlock,
        roomNo,
        parentName,
        parentEmail,
        parentPhone,
        year,   // Added
        branch, // Added
        isActive: true,
        isDefaulter: false
    });

    res.status(201).json({ 
        success: true, 
        message: "Student added successfully", 
        data: student 
    });

  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... updateStudentDetails function also needs to include year/branch in allowed updates
export const updateStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Update allowed fields including new ones
    const allowedUpdates = [
        "name", "phone", "email", "parentPhone", "parentEmail", 
        "hostelBlock", "roomNo", "year", "branch" 
    ];

    Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            student[key] = req.body[key];
        }
    });

    await student.save();
    res.json({ success: true, data: student, message: "Student updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ... existing imports

// @desc    Get All Security Guards (Warden View)
// @route   GET /api/warden/guards
// @access  Private (Warden)
export const getWardenGuards = async (req, res) => {
  try {
    const guards = await Security.find().select("-password").sort({ isActive: -1, name: 1 });
    res.json({ success: true, data: guards });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add New Security Guard (Warden)
// @route   POST /api/warden/guards
// @access  Private (Warden)
export const addWardenGuard = async (req, res) => {
  try {
    const { name, guardId, phone, email, gateLocation, shift, password } = req.body;

    const exists = await Security.findOne({ guardId });
    if (exists) return res.status(400).json({ success: false, message: "Guard ID already exists" });

    const initialPassword = password || guardId;

    const guard = await Security.create({
        name, 
        guardId, 
        phone, 
        email, 
        gateLocation, 
        shift, // Ensure this matches your Schema Enum!
        password: initialPassword,
        isActive: true
    });

    res.status(201).json({ success: true, message: "Guard added successfully", data: guard });
  } catch (error) {
    // Console log the ACTUAL error from Mongoose
    console.error("Error adding guard:", error.message); 
    
    // Send the specific error message to the frontend for better debugging
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Guard Details & Logs
// @route   GET /api/warden/guards/:id
// @access  Private (Warden)
export const getWardenGuardDetails = async (req, res) => {
  try {
    const guard = await Security.findById(req.params.id).select("-password");
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });

    // Fetch recent logs for this guard
    const logs = await GateLog.find({ guardId: guard._id })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean(); // You might need to populate 'studentId' or pass details depending on your GateLog schema

    res.json({ success: true, data: { guard, logs } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Guard (Warden)
// @route   PUT /api/warden/guards/:id
// @access  Private (Warden)
export const updateWardenGuard = async (req, res) => {
  try {
    const guard = await Security.findById(req.params.id);
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });

    const allowed = ["name", "phone", "email", "gateLocation", "shift"];
    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) {
        guard[key] = req.body[key];
      }
    });

    await guard.save();
    res.json({ success: true, message: "Guard updated", data: guard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle/Delete Guard (Warden)
// Note: Usually Admin does delete, but if Warden needs it:
export const deleteWardenGuard = async (req, res) => {
    try {
        await Security.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Guard deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const toggleWardenGuardStatus = async (req, res) => {
    try {
        const guard = await Security.findById(req.params.id);
        guard.isActive = !guard.isActive;
        await guard.save();
        res.json({ success: true, message: "Status updated", data: { isActive: guard.isActive } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// ... existing imports

// @desc    Get Current Warden Profile
// @route   GET /api/warden/profile
// @access  Private (Warden)
export const getWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id).select("-password");
    
    if (!warden) {
        return res.status(404).json({ success: false, message: "Warden not found" });
    }

    // Optional: Calculate stats for "Assigned Jurisdiction" card
    const studentCount = await Student.countDocuments({ hostelBlock: warden.assignedBlock });

    res.json({ 
        success: true, 
        data: {
            ...warden.toObject(),
            studentCount
        } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Warden Profile
// @route   PUT /api/warden/profile
// @access  Private (Warden)
export const updateWardenProfile = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);
    
    if (!warden) return res.status(404).json({ success: false, message: "Warden not found" });

    // Allow updating basic fields only (not empId or assignedBlock for security)
    const { name, phone, email } = req.body;
    
    if (name) warden.name = name;
    if (phone) warden.phone = phone;
    if (email) warden.email = email;

    // Handle Password Change if provided
    if (req.body.newPassword) {
        // You might want to verify currentPassword here first for extra security
        warden.password = req.body.newPassword; 
    }

    await warden.save();

    res.json({ 
        success: true, 
        message: "Profile updated successfully", 
        data: {
            name: warden.name,
            email: warden.email,
            phone: warden.phone
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// @desc    Get Active Defaulters (Warden View)
// @route   GET /api/warden/defaulters
// @access  Private (Warden)
export const getActiveDefaulters = async (req, res) => {
  try {
    const defaulters = await Defaulter.find({ isActive: true })
        .populate("studentId", "name regNo hostelBlock roomNo")
        .populate("passId") // Assuming passId refers to DayPass/HomePass
        .sort({ createdAt: -1 });

    // Format for frontend
    const formattedData = defaulters.map(d => {
        // Calculate "Late By" logic if pass details exist
        let lateText = "N/A";
        const pass = d.passId;
        
        if (pass && pass.expectedIn && pass.actualInTime) {
            const expected = new Date(pass.expectedIn);
            const actual = new Date(pass.actualInTime);
            const diffMs = actual - expected;
            if (diffMs > 0) {
                const diffHrs = Math.floor(diffMs / 3600000);
                const diffMins = Math.round((diffMs % 3600000) / 60000);
                lateText = `+${diffHrs}h ${diffMins}m`;
            }
        }

        return {
            _id: d._id,
            studentName: d.studentId?.name || "Unknown",
            regNo: d.studentId?.regNo,
            date: d.createdAt,
            reason: d.reason || "Late Return",
            lateBy: lateText,
            isActive: d.isActive
        };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Fetch Defaulters Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Clear Defaulter Status
// @route   PUT /api/warden/defaulters/:id/clear
// @access  Private (Warden)
export const clearDefaulterStatus = async (req, res) => {
  try {
    const defaulterRecord = await Defaulter.findById(req.params.id);
    
    if (!defaulterRecord) {
        return res.status(404).json({ success: false, message: "Defaulter record not found" });
    }

    if (!defaulterRecord.isActive) {
        return res.status(400).json({ success: false, message: "Already cleared" });
    }

    // 1. Update Defaulter Record
    defaulterRecord.isActive = false;
    defaulterRecord.clearedBy = req.user._id; // Warden ID
    defaulterRecord.clearedAt = Date.now(); // Optional field in model
    await defaulterRecord.save();

    // 2. Update Student Flag
    // Check if student has any other active defaulter records
    const otherActiveRecords = await Defaulter.countDocuments({ 
        studentId: defaulterRecord.studentId, 
        isActive: true 
    });

    if (otherActiveRecords === 0) {
        const student = await Student.findById(defaulterRecord.studentId);
        if (student) {
            student.isDefaulter = false;
            await student.save();
        }
    }

    res.json({ success: true, message: "Defaulter status cleared" });
  } catch (error) {
    console.error("Clear Defaulter Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};