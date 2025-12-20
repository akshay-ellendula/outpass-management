import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from 'crypto';

const wardenSchema = new mongoose.Schema({
    empId: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    assignedBlock: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

wardenSchema.pre("save", async function () { // Remove 'next' parameter
    if (!this.isModified("password")) return; // Just return if not modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next()
});

wardenSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

wardenSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Warden = mongoose.model("Warden", wardenSchema);
export default Warden;