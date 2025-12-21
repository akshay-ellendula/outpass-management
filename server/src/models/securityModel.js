import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from 'crypto'; //

const securitySchema = new mongoose.Schema({
    guardId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    gateLocation: { type: String, required: true },
    shift: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    email: { type: String },

    // Fix: Added missing fields for password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

securitySchema.pre("save", async function () { 
    if (!this.isModified("password")) return; 

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

securitySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Fix: Added missing method to generate reset token
securitySchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    return resetToken;
};

const Security = mongoose.model("Security", securitySchema);
export default Security;