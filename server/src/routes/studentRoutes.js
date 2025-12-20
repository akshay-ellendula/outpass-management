import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    getStudentDashboard, getStudentProfile, applyDayPass,
    applyHomePass, getPassByToken,      // <--- Import
    guardianPassAction,getPassDetails
} from '../controller/studentController.js'; // Import the new function

const router = express.Router();

// === PUBLIC ROUTES (No Auth Required) ===
router.get('/public/pass/:token', getPassByToken);
router.post('/public/pass/:token/action', guardianPassAction);

// Existing Dashboard Route
router.get('/dashboard', protect, authorize('student'), getStudentDashboard);

// NEW Profile Route
router.get('/profile', protect, authorize('student'), getStudentProfile);

// Pass Application Routes
router.post('/apply/day', protect, authorize('student'), applyDayPass);
router.post('/apply/home', protect, authorize('student'), applyHomePass);
router.get('/pass/:id', protect, authorize('student'), getPassDetails);

export default router;