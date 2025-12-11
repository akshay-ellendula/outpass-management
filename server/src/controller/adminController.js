import Warden from '../models/wardenModel.js';

// @desc    Create a new Warden
// @route   POST /api/admin/create-warden
// @access  Private (Admin only)
export const createWarden = async (req, res) => {
    const { empId, name, email, password, phone, assignedBlock } = req.body;

    try {
        // 1. Validation
        if (!empId || !name || !email || !password || !assignedBlock) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check duplicates
        const existingWarden = await Warden.findOne({ empId });
        if (existingWarden) {
            return res.status(409).json({ message: "Warden with this EmpID already exists" });
        }

        // 3. Create Warden
        // Password hashing happens automatically in your Warden Model pre-save
        const warden = await Warden.create({
            empId,
            name,
            email,
            password,
            phone,
            assignedBlock,
            role: 'warden'
        });

        res.status(201).json({
            success: true,
            message: "Warden profile created successfully",
            data: {
                id: warden._id,
                name: warden.name,
                empId: warden.empId,
                block: warden.assignedBlock
            }
        });

    } catch (error) {
        console.error("Create Warden Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};