import express from 'express';
import { 
    studentSignup, 
    studentSignin, 
    wardenSignup, 
    wardenSignin, 
    securitySignup, 
    securitySignin, 
    adminSignup, 
    adminSignin, 
    logout, 
    verifyAuth 
} from '../controller/authController.js';

const router = express.Router();

// Student Routes
router.post('/studentSignup', studentSignup);
router.post('/studentSignin', studentSignin);

// Warden Routes
router.post('/wardenSignup', wardenSignup);
router.post('/wardenSignin', wardenSignin);

// Security Routes
router.post('/securitySignup', securitySignup);
router.post('/securitySignin', securitySignin);

// Admin Routes
router.post('/adminSignup', adminSignup);
router.post('/adminSignin', adminSignin);

// Common Routes
router.post('/logout', logout);
router.get('/verify', verifyAuth);

export default router;