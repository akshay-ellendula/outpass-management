import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createWarden, createGuard } from '../controller/adminController.js';

const router = express.Router();

router.post('/create-warden', protect, authorize('admin'), createWarden);
router.post('/create-guard', protect, authorize('admin'), createGuard);

export default router;