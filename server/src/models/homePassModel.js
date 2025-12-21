import mongoose from "mongoose";
import crypto from 'crypto';

const homePassSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    reason: { type: String, required: true },

    // Multi-day duration
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    // Workflow: PENDING_GUARDIAN -> PENDING_WARDEN -> APPROVED
    // ... inside the schema ...
    status: {
        type: String,
        // ADD 'CURRENTLY_OUT' HERE 👇
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'EXPIRED', 'CURRENTLY_OUT', 'CANCELLED', 'PENDING_GUARDIAN', 'PENDING_WARDEN'],
        default: 'PENDING'
    },

    // Guardian Logic
    isGuardianApproved: { type: Boolean, default: false },
    guardianApprovalToken: { type: String, select: false },

    // Warden Logic
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Warden" },
    rejectionReason: { type: String },

    // Gate Data
    qrCode: { type: String, unique: true, sparse: true },
    actualOutTime: { type: Date },
    actualInTime: { type: Date },

    isLate: { type: Boolean, default: false }

}, { timestamps: true });

homePassSchema.methods.generateQR = function () {
    this.qrCode = crypto.randomBytes(16).toString('hex');
    return this.qrCode;
};

homePassSchema.methods.getGuardianToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.guardianApprovalToken = crypto.createHash('sha256').update(token).digest('hex');
    return token;
};

const HomePass = mongoose.model("HomePass", homePassSchema);
export default HomePass;