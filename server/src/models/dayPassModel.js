import mongoose from "mongoose";
import crypto from 'crypto';

const dayPassSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    expectedOut: { type: Date },
    expectedIn: { type: Date },

    status: {
        type: String,
        // ADD 'CURRENTLY_OUT' HERE 👇
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'EXPIRED', 'CURRENTLY_OUT', 'CANCELLED', 'PENDING_GUARDIAN', 'PENDING_WARDEN'],
        default: 'PENDING'
    },

    // Warden Approval
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Warden" },

    // Gate Data
    qrCode: { type: String, unique: true, sparse: true },
    actualOutTime: { type: Date },
    actualInTime: { type: Date },

    isLate: { type: Boolean, default: false } // Triggers Defaulter if true

}, { timestamps: true });

dayPassSchema.methods.generateQR = function () {
    this.qrCode = crypto.randomBytes(16).toString('hex');
    return this.qrCode;
};

const DayPass = mongoose.model("DayPass", dayPassSchema);
export default DayPass;