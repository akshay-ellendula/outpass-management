import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const securitySchema = new mongoose.Schema({
    guardId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    
    // Security Specifics
    gateLocation: { type: String, required: true },
}, { timestamps: true });

securitySchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

securitySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// CRITICAL: Model name MUST be "Security"
const Security = mongoose.model("Security", securitySchema);
export default Security;