import Student from "../models/studentModel.js";
import Warden from "../models/wardenModel.js";
import Security from "../models/securityModel.js";
import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import Defaulter from "../models/defaulterModel.js";
import GateLog from "../models/gateLogModel.js";
import SystemConfig from "../models/systemConfigModel.js";
// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Basic Counts
    const totalStudents = await Student.countDocuments();
    const activeStaff = (await Warden.countDocuments({ isActive: true })) + (await Security.countDocuments({ isActive: true }));
    const totalStaff = (await Warden.countDocuments()) + (await Security.countDocuments());
    
    const dayPassesToday = await DayPass.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    const homePassesToday = await HomePass.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });
    const totalPassesToday = dayPassesToday + homePassesToday;
    
    const activeDefaulters = await Defaulter.countDocuments({ isActive: true });

    // 2. Recent Activity
    const recentGateLogs = await GateLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("studentId", "name regNo")
      .populate("guardId", "name")
      .lean();

    const formattedLogs = recentGateLogs.map((log) => ({
      _id: log._id,
      type: "GATE_LOG",
      action: log.scanType,
      user: log.studentId ? log.studentId.name : "Unknown",
      role: "Student",
      details: `${log.scanType} at ${log.gateLocation}`,
      time: log.createdAt,
    }));

    // 3. (NEW) Weekly Stats Calculation
    // Generate dates for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    // Fetch counts for each day in parallel
    const weeklyStats = await Promise.all(last7Days.map(async (date) => {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        
        const end = new Date(date);
        end.setHours(23,59,59,999);
        
        const [dayCount, homeCount] = await Promise.all([
            DayPass.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            HomePass.countDocuments({ createdAt: { $gte: start, $lte: end } })
        ]);

        return {
            day: start.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Mon"
            count: dayCount + homeCount
        };
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStaff,
        totalStaff,
        totalPassesToday,
        activeDefaulters,
        recentActivity: formattedLogs,
        weeklyStats // <--- Added this
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// ... rest of the file

// @desc    Get all Wardens
// @route   GET /api/admin/wardens
// @access  Private (Admin)
export const getAllWardens = async (req, res) => {
  try {
    const wardens = await Warden.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: wardens });
  } catch (error) {
    console.error("Fetch Wardens Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Helper to generate formatted Warden ID (e.g., WRD-4921)
const generateWardenId = async () => {
  let isUnique = false;
  let randomId = "";

  while (!isUnique) {
    // Generate 'WRD-' followed by 4 random digits
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    randomId = `WRD-${randomNum}`;

    // Check if this ID already exists
    const existing = await Warden.findOne({ empId: randomId });
    if (!existing) {
      isUnique = true;
    }
  }
  return randomId;
};

// @desc    Register a new Warden
// @route   POST /api/admin/wardens
// @access  Private (Admin)
export const createWarden = async (req, res) => {
  try {
    // empId is NOT expected from req.body anymore
    const { name, phone, email, assignedBlock, password } = req.body;

    // 1. Validate required fields
    if (!name || !phone || !email || !assignedBlock || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all fields." 
      });
    }

    // 2. Check if warden exists (by Email only now)
    const existingWarden = await Warden.findOne({ email });
    if (existingWarden) {
      return res.status(400).json({ 
        success: false, 
        message: "Warden with this Email already exists." 
      });
    }

    // 3. Generate Random Warden ID
    const empId = await generateWardenId();

    // 4. Create Warden
    const warden = await Warden.create({
      name,
      phone,
      email,
      empId, // Auto-generated ID
      assignedBlock,
      password,
      isActive: true,
    });

    if (warden) {
      res.status(201).json({
        success: true,
        data: {
          _id: warden._id,
          name: warden.name,
          email: warden.email,
          empId: warden.empId,
          assignedBlock: warden.assignedBlock,
        },
        message: `Warden created successfully! ID: ${warden.empId}`,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid warden data" });
    }
  } catch (error) {
    console.error("Create Warden Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Warden by DB ID
// @route   GET /api/admin/wardens/:id
// @access  Private (Admin)
export const getWardenById = async (req, res) => {
  try {
    // We use findById because the frontend sends the MongoDB _id
    const warden = await Warden.findById(req.params.id).select("-password");
    
    if (warden) {
      res.json({ success: true, data: warden });
    } else {
      res.status(404).json({ success: false, message: "Warden not found" });
    }
  } catch (error) {
    console.error("Error fetching warden:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Warden Details
// @route   PUT /api/admin/wardens/:id
// @access  Private (Admin)
export const updateWarden = async (req, res) => {
  try {
    const { name, phone, email, assignedBlock } = req.body;
    
    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    // Update fields if provided
    warden.name = name || warden.name;
    warden.phone = phone || warden.phone;
    warden.email = email || warden.email;
    warden.assignedBlock = assignedBlock || warden.assignedBlock;

    const updatedWarden = await warden.save();
    
    res.json({
      success: true,
      data: updatedWarden,
      message: "Warden updated successfully",
    });
  } catch (error) {
    console.error("Error updating warden:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle Warden Status (Activate/Deactivate)
// @route   PATCH /api/admin/wardens/:id/status
// @access  Private (Admin)
export const toggleWardenStatus = async (req, res) => {
  try {
    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    warden.isActive = !warden.isActive; 
    await warden.save();

    res.json({
      success: true,
      message: `Warden ${warden.isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: warden.isActive }
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete Warden
// @route   DELETE /api/admin/wardens/:id
// @access  Private (Admin)
export const deleteWarden = async (req, res) => {
  try {
    const warden = await Warden.findById(req.params.id);
    if (!warden) {
      return res.status(404).json({ success: false, message: "Warden not found" });
    }

    await warden.deleteOne(); // Or findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Warden account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Warden Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get All Security Guards
// @route   GET /api/admin/guards
// @access  Private (Admin)
export const getAllGuards = async (req, res) => {
  try {
    const guards = await Security.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: guards });
  } catch (error) {
    console.error("Fetch Guards Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Helper to generate formatted Guard ID (e.g., SEC-4921)
const generateGuardId = async () => {
  let isUnique = false;
  let randomId = "";

  while (!isUnique) {
    // Generate 'SEC-' followed by 4 random digits
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    randomId = `SEC-${randomNum}`;

    // Check if this ID already exists
    const existing = await Security.findOne({ guardId: randomId });
    if (!existing) {
      isUnique = true;
    }
  }
  return randomId;
};

// @desc    Register a New Guard
// @route   POST /api/admin/guards
// @access  Private (Admin)
export const createGuard = async (req, res) => {
  try {
    // guardId is NOT expected from req.body
    const { name, password, gateLocation, shift } = req.body;

    // 1. Validate inputs
    if (!name || !password || !gateLocation) {
        return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    // 2. Generate Random Guard ID
    const guardId = await generateGuardId();

    // 3. Create Guard
    const guard = await Security.create({
      name,
      guardId, // Auto-generated ID
      password,
      gateLocation,
      shift: shift || 'Day',
      isActive: true
    });

    if (guard) {
      res.status(201).json({
        success: true,
        data: {
          _id: guard._id,
          name: guard.name,
          guardId: guard.guardId,
          gateLocation: guard.gateLocation
        },
        message: `Security Guard registered successfully! ID: ${guard.guardId}`
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid guard data" });
    }
  } catch (error) {
    console.error("Create Guard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Guard by ID
// @route   GET /api/admin/guards/:id
// @access  Private (Admin)
export const getGuardById = async (req, res) => {
  try {
    const guard = await Security.findById(req.params.id).select("-password");
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });
    res.json({ success: true, data: guard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Guard
// @route   PUT /api/admin/guards/:id
// @access  Private (Admin)
export const updateGuard = async (req, res) => {
  try {
    const { name, gateLocation, shift } = req.body;
    const guard = await Security.findById(req.params.id);

    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });

    guard.name = name || guard.name;
    guard.gateLocation = gateLocation || guard.gateLocation;
    guard.shift = shift || guard.shift;

    const updatedGuard = await guard.save();
    res.json({ success: true, data: updatedGuard, message: "Guard updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle Guard Status (Active/Inactive)
// @route   PATCH /api/admin/guards/:id/status
// @access  Private (Admin)
export const toggleGuardStatus = async (req, res) => {
  try {
    const guard = await Security.findById(req.params.id);
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });

    guard.isActive = !guard.isActive;
    await guard.save();

    res.json({ success: true, message: `Guard ${guard.isActive ? "activated" : "deactivated"}`, data: { isActive: guard.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete Guard
// @route   DELETE /api/admin/guards/:id
// @access  Private (Admin)
export const deleteGuard = async (req, res) => {
  try {
    const guard = await Security.findById(req.params.id);
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });

    await guard.deleteOne();
    res.json({ success: true, message: "Guard deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// @desc    Get All Students
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Fetch Students Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Register a New Student
// @route   POST /api/admin/students
// @access  Private (Admin)
export const createStudent = async (req, res) => {
  try {
    const { 
      regNo, name, email, phone, password, 
      hostelBlock, roomNo, 
      parentName, parentEmail, parentPhone 
    } = req.body;

    // 1. Check if student exists (RegNo or Email)
    const existingStudent = await Student.findOne({ $or: [{ email }, { regNo }] });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Student with this RegNo or Email already exists" });
    }

    // 2. Create Student
    const student = await Student.create({
      regNo,
      name,
      email,
      phone,
      password, // Hashed by model pre-save hook
      hostelBlock,
      roomNo,
      parentName,
      parentEmail,
      parentPhone,
      isActive: true,
      isDefaulter: false
    });

    if (student) {
      res.status(201).json({
        success: true,
        data: student,
        message: "Student registered successfully!"
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid student data" });
    }
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Student
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Student
// @route   PUT /api/admin/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Update fields dynamically
    Object.keys(req.body).forEach((key) => {
        // Prevent updating password directly here if strictly not needed, or handle separately
        if(key !== 'password' && req.body[key] !== undefined) {
            student[key] = req.body[key];
        }
    });

    const updatedStudent = await student.save();
    res.json({ success: true, data: updatedStudent, message: "Student updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete Student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    await student.deleteOne();
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... (Existing imports and functions)

// ---------------- System Settings ----------------

// @desc    Get Global System Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSystemSettings = async (req, res) => {
  try {
    // Try to find the config document, if not exists, create a default one
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Global System Settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSystemSettings = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    // Update fields
    const { 
        emergencyFreeze, 
        dayPassStartTime, 
        dayPassEndTime, 
        autoMarkDefaulters, 
        homePassAutoApprove, 
        dayPassAutoApprove 
    } = req.body;

    if (emergencyFreeze !== undefined) config.emergencyFreeze = emergencyFreeze;
    if (dayPassStartTime) config.dayPassStartTime = dayPassStartTime;
    if (dayPassEndTime) config.dayPassEndTime = dayPassEndTime;
    if (autoMarkDefaulters !== undefined) config.autoMarkDefaulters = autoMarkDefaulters;
    if (homePassAutoApprove !== undefined) config.homePassAutoApprove = homePassAutoApprove;
    if (dayPassAutoApprove !== undefined) config.dayPassAutoApprove = dayPassAutoApprove;

    await config.save();
    res.json({ success: true, data: config, message: "System configuration updated" });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------------- Admin Profile ----------------

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Assuming req.user is populated by authMiddleware
    const admin = await Admin.findById(req.user._id); 

    if (!admin) {
        return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    // Update to new password (pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};