import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createStudent, getDefaulters, clearDefaulter } from '../controller/wardenController.js';

const router = express.Router();

router.post('/create-student', protect, authorize('warden'), createStudent);
router.get('/defaulters', protect, authorize('warden'), getDefaulters);
router.put('/defaulter/:id/clear', protect, authorize('warden'), clearDefaulter);

export default router;