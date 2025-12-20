import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Warden from '../models/wardenModel.js';
import Student from '../models/studentModel.js';
import Security from '../models/securityModel.js';

// ================================
// Protect Middleware
// ================================
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // ✅ FIXED SECRET NAME
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;

        // ✅ FIXED decoded.userId
        switch (decoded.role) {
            case 'student':
                user = await Student.findById(decoded.userId).select('-password');
                break;
            case 'warden':
                user = await Warden.findById(decoded.userId).select('-password');
                break;
            case 'security':
                user = await Security.findById(decoded.userId).select('-password');
                break;
            case 'admin':
                user = await Admin.findById(decoded.userId).select('-password');
                break;
            default:
                return res.status(401).json({ message: 'Invalid role' });
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                message: 'Account is inactive. Contact admin.'
            });
        }

        // Attach role safely
        req.user = { ...user.toObject(), role: decoded.role };

        next(); // ✅ now next is ALWAYS valid
    } catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token failed'
        });
    }
};

// ================================
// Role Authorization
// ================================
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied for role '${req.user?.role}'`
            });
        }
        next();
    };
};
