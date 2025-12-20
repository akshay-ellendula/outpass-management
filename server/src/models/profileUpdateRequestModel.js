import mongoose from "mongoose";

const profileUpdateRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    
    // Stores only the fields that are being changed
    // e.g. { parentPhone: "999...", parentEmail: "new@..." }
    updates: { type: Object, required: true }, 
    
    status: { 
        type: String, 
        enum: ["PENDING", "APPROVED", "REJECTED"], 
        default: "PENDING" 
    },
    
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "Warden" },
    actionDate: Date,
    rejectionReason: String

}, { timestamps: true });

const ProfileUpdateRequest = mongoose.model("ProfileUpdateRequest", profileUpdateRequestSchema);
export default ProfileUpdateRequest;