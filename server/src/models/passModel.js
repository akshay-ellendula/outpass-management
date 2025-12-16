import mongoose from "mongoose";

const passSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    type: { type: String, enum: ['Day Pass', 'Home Pass'], required: true },
    reason: { type: String, required: true },
    destination: { type: String, required: true },
    transportMode: { type: String },
    
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    
    status: {
        type: String,
        enum: ['PENDING_GUARDIAN', 'PENDING_WARDEN', 'APPROVED', 'REJECTED', 'OUT', 'USED', 'CANCELLED', 'EXPIRED'],
        default: 'PENDING_WARDEN'
    },
    
    // Home Pass Flags
    isParentApproved: { type: Boolean, default: false },
    parentApprovalToken: { type: String, select: false },

    // Warden Logic
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Warden" },
    rejectionReason: { type: String },
    
    // Security Logic
    qrCode: { type: String },
    actualOutTime: Date,
    actualInTime: Date

}, { timestamps: true });

const Pass = mongoose.model("Pass", passSchema);
export default Pass;