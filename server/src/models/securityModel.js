import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const securitySchema = new mongoose.Schema({
    guardId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    gateLocation: { type: String, required: true },
    shift: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    phone: { type: String },
    email: { type: String },
}, { timestamps: true });

securitySchema.pre("save", async function () { // Remove 'next' parameter
    if (!this.isModified("password")) return; // Just return if not modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next()
});

securitySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Security = mongoose.model("Security", securitySchema);
export default Security;