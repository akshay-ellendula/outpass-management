import Student from "../models/studentModel.js";
import Warden from "../models/wardenModel.js";
import Security from "../models/securityModel.js";
import DayPass from "../models/dayPassModel.js";
import HomePass from "../models/homePassModel.js";
import Defaulter from "../models/defaulterModel.js";
import GateLog from "../models/gateLogModel.js";

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Total Students
    const totalStudents = await Student.countDocuments();

    // 2. Staff Stats (Wardens + Security)
    const activeWardens = await Warden.countDocuments({ isActive: true });
    const totalWardens = await Warden.countDocuments();
    const activeGuards = await Security.countDocuments({ isActive: true });
    const totalGuards = await Security.countDocuments();

    const activeStaff = activeWardens + activeGuards;
    const totalStaff = totalWardens + totalGuards;

    // 3. Total Passes Today
    const dayPassesToday = await DayPass.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const homePassesToday = await HomePass.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const totalPassesToday = dayPassesToday + homePassesToday;

    // 4. System Alerts (Active Defaulters)
    const activeDefaulters = await Defaulter.countDocuments({ isActive: true });

    // 5. Recent Activity Feed (Using GateLogs)
    const recentGateLogs = await GateLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("studentId", "name regNo")
      .populate("guardId", "name")
      .lean();

    const formattedLogs = recentGateLogs.map((log) => ({
      _id: log._id,
      type: "GATE_LOG",
      action: log.scanType, // CHECK_IN, CHECK_OUT, DENIED
      user: log.guardId ? log.guardId.name : "Unknown Guard",
      role: "Security",
      details: `${log.scanType} for ${log.studentId ? log.studentId.name : "Student"}`,
      time: log.createdAt,
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
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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

// @desc    Register a new Warden
// @route   POST /api/admin/wardens
// @access  Private (Admin)
export const createWarden = async (req, res) => {
  try {
    const { empId, name, email, password, phone, assignedBlock } = req.body;

    // Check if warden exists
    const wardenExists = await Warden.findOne({ $or: [{ email }, { empId }] });
    if (wardenExists) {
      return res.status(400).json({ success: false, message: "Warden already exists (Email or Emp ID)" });
    }

    const warden = await Warden.create({
      empId,
      name,
      email,
      password, // Pre-save hook in model will hash this
      phone,
      assignedBlock,
    });

    if (warden) {
      res.status(201).json({
        success: true,
        data: {
          _id: warden._id,
          name: warden.name,
          email: warden.email,
          assignedBlock: warden.assignedBlock,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid warden data" });
    }
  } catch (error) {
    console.error("Create Warden Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};