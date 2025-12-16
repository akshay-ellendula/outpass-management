import Pass from '../models/passModel.js';
import GateLog from '../models/gateLogModel.js';
import Student from '../models/studentModel.js';
import Defaulter from '../models/defaulterModel.js';
import jwt from 'jsonwebtoken';

export const scanPass = async (req, res) => {
    const { qrString, scanType } = req.body; // 'CHECK_OUT' or 'CHECK_IN'
    
    try {
        // Verify QR
        const decoded = jwt.verify(qrString, process.env.JWT_SECRET_KEY);
        const pass = await Pass.findById(decoded.passId);
        
        if (!pass) return res.status(404).json({ message: "Pass not found" });

        // OUT Logic
        if (scanType === 'CHECK_OUT') {
            if (pass.status !== 'APPROVED') return res.status(400).json({ message: "Pass not approved for exit" });
            pass.status = 'OUT';
            pass.actualOutTime = new Date();
            await pass.save();
        } 
        // IN Logic
        else if (scanType === 'CHECK_IN') {
            if (pass.status !== 'OUT') return res.status(400).json({ message: "Student hasn't scanned out" });
            
            pass.status = 'USED';
            pass.actualInTime = new Date();
            
            // Defaulter Check
            if (new Date() > new Date(pass.toDate)) {
                await Student.findByIdAndUpdate(pass.studentId, { isDefaulter: true });
                await Defaulter.create({
                    studentId: pass.studentId,
                    passId: pass._id,
                    reason: "Late Return"
                });
            }
            await pass.save();
        }

        // Log it
        await GateLog.create({
            passId: pass._id,
            studentId: pass.studentId,
            guardId: req.user.id,
            scanType,
            gateLocation: req.user.gateLocation
        });

        res.status(200).json({ success: true, message: "Scan Successful" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};