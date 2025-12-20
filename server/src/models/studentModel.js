import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from 'crypto';

const studentSchema = new mongoose.Schema({
    regNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Academic Info (Added)
    year: { type: String, required: true, default: "1st Year" }, 
    branch: { type: String, required: true, default: "General" },

    // Hostel & Guardian
    hostelBlock: { type: String, required: true },
    roomNo: { type: String, required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    
    // Logic Flags
    isDefaulter: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

studentSchema.pre("save", async function () { // Remove 'next' parameter
    if (!this.isModified("password")) return; // Just return if not modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next()
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Student = mongoose.model("Student", studentSchema);
export default Student;