import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
    regNo: {
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
    
    // Student Specifics
    hostelBlock: { type: String, required: true },
    roomNo: { type: String, required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    
    isDefaulter: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Hash Password Pre-save
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare Password Method
studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// CRITICAL: Model name is "Student"
const Student = mongoose.model("Student", studentSchema);
export default Student;