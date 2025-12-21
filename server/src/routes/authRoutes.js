import express from 'express';
import { 
    studentSignin, 
    wardenSignin, 
    securitySignin, 
    adminSignup, 
    adminSignin, 
    logout, 
    verifyAuth,
    forgotPassword, 
    resetPassword
} from '../controller/authcontroller.js';

const router = express.Router();

router.post('/studentSignin', studentSignin);
router.post('/wardenSignin', wardenSignin);
router.post('/securitySignin', securitySignin);
router.post('/adminSignin', adminSignin);
router.post('/adminSignup', adminSignup); // Keep for setup
router.post('/logout', logout);
router.get('/verify', verifyAuth);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;