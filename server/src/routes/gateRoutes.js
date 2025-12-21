import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
    getGateDashboard, 
    verifyAndLog,
    getGateLogs,       // <--- Add
    getGuardProfile,   // <--- Add
    updateGuardPassword, // <--- Add
    updateGuardProfile,
} from '../controller/gateController.js';

const router = express.Router();

// Protect all routes: Only Security Guard Role
router.use(protect);
router.use(authorize('security'));

router.get('/dashboard', getGateDashboard);
router.post('/verify', verifyAndLog);

router.get('/logs', getGateLogs);
router.get('/profile', getGuardProfile);
router.put('/profile/password', updateGuardPassword);
router.put('/profile', updateGuardProfile);

export default router;