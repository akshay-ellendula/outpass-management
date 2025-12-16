import Pass from '../models/passModel.js';
import Student from '../models/studentModel.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// 1. APPLY PASS
export const applyPass = async (req, res) => {
    try {
        const { type, reason, destination, fromDate, toDate, transportMode } = req.body;
        const studentId = req.user.id;

        const student = await Student.findById(studentId);
        if (student.isDefaulter) {
            return res.status(403).json({ message: "You are a Defaulter. Contact Warden." });
        }

        let initialStatus = 'PENDING_WARDEN';
        let parentToken = undefined;

        if (type === 'Home Pass') {
            initialStatus = 'PENDING_GUARDIAN';
            parentToken = crypto.randomBytes(20).toString('hex');
        }

        const newPass = await Pass.create({
            studentId, type, reason, destination, transportMode,
            fromDate, toDate, status: initialStatus, parentApprovalToken: parentToken
        });

        if (type === 'Home Pass') {
            const link = `${process.env.FRONTEND_URL}/parent-approval/${parentToken}`;
            await sendEmail({
                email: student.parentEmail,
                subject: 'Approve Home Pass',
                message: `Click to approve pass for ${student.name}: ${link}`
            });
        }

        res.status(201).json({ success: true, data: newPass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. PARENT APPROVAL (Public)
export const parentApprovalAction = async (req, res) => {
    const { token } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    try {
        const pass = await Pass.findOne({ parentApprovalToken: token });
        if (!pass || pass.status !== 'PENDING_GUARDIAN') {
            return res.status(400).json({ message: "Invalid Request" });
        }

        if (action === 'APPROVE') {
            pass.status = 'PENDING_WARDEN';
            pass.isParentApproved = true;
            pass.parentApprovalToken = undefined;
        } else {
            pass.status = 'REJECTED';
            pass.rejectionReason = "Parent Rejected";
            pass.parentApprovalToken = undefined;
        }
        await pass.save();
        res.status(200).json({ success: true, message: `Pass ${action}D` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. WARDEN ACTIONS
export const getPendingPasses = async (req, res) => {
    try {
        // Filter by students in Warden's block
        const passes = await Pass.find({ status: 'PENDING_WARDEN' })
            .populate({
                path: 'studentId',
                match: { hostelBlock: req.user.assignedBlock }
            });
        
        // Remove nulls (students from other blocks)
        const filtered = passes.filter(p => p.studentId);
        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const wardenAction = async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body; // 'APPROVE' / 'REJECT'

    try {
        const pass = await Pass.findById(id);
        if(!pass) return res.status(404).json({ message: "Pass not found" });

        if (action === 'APPROVE') {
            pass.status = 'APPROVED';
            pass.approvedBy = req.user.id;
            // Generate QR
            pass.qrCode = jwt.sign(
                { passId: pass._id, studentId: pass.studentId }, 
                process.env.JWT_SECRET_KEY
            );
        } else {
            pass.status = 'REJECTED';
            pass.rejectionReason = reason;
            pass.approvedBy = req.user.id;
        }
        await pass.save();
        res.status(200).json({ success: true, data: pass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};