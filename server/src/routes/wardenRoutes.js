import express from 'express';
import { createStudent, createSecurity } from '../controller/wardenController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only 'warden' role can access these routes
router.post('/create-student', protect, authorize('warden'), createStudent);
router.post('/create-security', protect, authorize('warden'), createSecurity);

export default router;