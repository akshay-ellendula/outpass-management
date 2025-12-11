import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Warden from '../models/wardenModel.js';

// 1. Verify Token (Authentication)
export const protect = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Attach user info to request based on role
        if (decoded.role === 'admin') {
            req.user = await Admin.findById(decoded.id).select('-password');
        } else if (decoded.role === 'warden') {
            req.user = await Warden.findById(decoded.id).select('-password');
        } else {
            // For student/security if needed later
            req.user = decoded; 
        }

        if (!req.user) {
             return res.status(401).json({ message: "User no longer exists" });
        }

        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// 2. Check Role (Authorization)
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