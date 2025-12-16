import mongoose from "mongoose";

const defaulterSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
    reason: { type: String, required: true },
    isActive: { type: Boolean, default: true }, // Currently blocked?
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Warden" },
    clearedAt: { type: Date }
}, { timestamps: true });

const Defaulter = mongoose.model("Defaulter", defaulterSchema);
export default Defaulter;