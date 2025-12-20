import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createWarden,getDashboardStats,getAllWardens} from '../controller/adminController.js';

const router = express.Router();

router.post('/create-warden', protect, authorize('admin'), createWarden);
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);
router.get('/wardens', protect, authorize('admin'), getAllWardens);
router.post('/wardens', protect, authorize('admin'), createWarden);

export default router;