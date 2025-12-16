import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { applyPass, getPendingPasses, wardenAction } from '../controller/passController.js';

const router = express.Router();

// Student
router.post('/apply', protect, authorize('student'), applyPass);

// Warden
router.get('/pending', protect, authorize('warden'), getPendingPasses);
router.put('/:id/action', protect, authorize('warden'), wardenAction);

export default router;