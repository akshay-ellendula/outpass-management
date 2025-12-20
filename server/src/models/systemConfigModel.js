import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema({
    emergencyFreeze: { type: Boolean, default: false },
    dayPassStartTime: { type: String, default: "06:00" }, // 24hr format
    dayPassEndTime: { type: String, default: "21:00" },   // 24hr format
    autoMarkDefaulters: { type: Boolean, default: true },
    homePassAutoApprove: { type: Boolean, default: false },
    dayPassAutoApprove: { type: Boolean, default: false }
}, { timestamps: true });

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;