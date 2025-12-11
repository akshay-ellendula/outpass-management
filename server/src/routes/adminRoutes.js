import express from 'express';
import { createWarden } from '../controller/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only 'admin' role can access this route
router.post('/create-warden', protect, authorize('admin'), createWarden);

export default router;