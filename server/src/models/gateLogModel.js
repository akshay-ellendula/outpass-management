import mongoose from "mongoose";

const gateLogSchema = new mongoose.Schema({
    passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    guardId: { type: mongoose.Schema.Types.ObjectId, ref: "Security", required: true },
    
    scanType: { type: String, enum: ['CHECK_OUT', 'CHECK_IN', 'DENIED'], required: true },
    gateLocation: { type: String, required: true },
    comment: { type: String },
    
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const GateLog = mongoose.model("GateLog", gateLogSchema);
export default GateLog;