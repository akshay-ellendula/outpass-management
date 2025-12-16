import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Warden from '../models/wardenModel.js';
import Student from '../models/studentModel.js';
import Security from '../models/securityModel.js';

// 1. Verify Token & Attach User
export const protect = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        let user = null;

        // Fetch user based on Role
        switch (decoded.role) {
            case 'student':
                user = await Student.findById(decoded.id).select('-password');
                if (user) user.role = 'student'; 
                break;
            case 'warden':
                user = await Warden.findById(decoded.id).select('-password');
                if (user) user.role = 'warden';
                break;
            case 'security':
                user = await Security.findById(decoded.id).select('-password');
                if (user) user.role = 'security';
                break;
            case 'admin':
                user = await Admin.findById(decoded.id).select('-password');
                if (user) user.role = 'admin';
                break;
        }

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: "Account is inactive. Contact Admin." });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// 2. Role Guard
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Role '${req.user?.role}' is not authorized.` 
            });
        }
        next();
    };
};