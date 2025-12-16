import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { scanPass } from '../controller/gateController.js';

const router = express.Router();

router.post('/scan', protect, authorize('security'), scanPass);

export default router;