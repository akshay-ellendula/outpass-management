import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const wardenSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Warden Specifics
    assignedBlock: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Hash Password Pre-save
wardenSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare Password Method
wardenSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// CRITICAL: Model name MUST be "Warden" (This was your error)
const Warden = mongoose.model("Warden", wardenSchema);
export default Warden;