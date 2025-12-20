import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  getDashboardStats,
  getAllWardens,
  createWarden,
  getWardenById,
  updateWarden,
  toggleWardenStatus,
  deleteWarden,
  getAllGuards,
  createGuard,
  getGuardById,
  updateGuard,
  toggleGuardStatus,
  deleteGuard,
  getAllStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getSystemSettings,
  updateSystemSettings,
  changeAdminPassword
} from '../controller/adminController.js';

const router = express.Router();

// Dashboard
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

// Warden Management
router.post('/wardens', protect, authorize('admin'), createWarden);
router.get('/wardens', protect, authorize('admin'), getAllWardens);
router.get('/wardens/:id', protect, authorize('admin'), getWardenById);
router.put('/wardens/:id', protect, authorize('admin'), updateWarden);
router.patch('/wardens/:id/status', protect, authorize('admin'), toggleWardenStatus);
router.delete('/wardens/:id', protect, authorize('admin'), deleteWarden);

// Guard Management
router.post('/guards', protect, authorize('admin'), createGuard);
router.get('/guards', protect, authorize('admin'), getAllGuards);
router.get('/guards/:id', protect, authorize('admin'), getGuardById);
router.put('/guards/:id', protect, authorize('admin'), updateGuard);
router.patch('/guards/:id/status', protect, authorize('admin'), toggleGuardStatus);
router.delete('/guards/:id', protect, authorize('admin'), deleteGuard);

// Student Routes
router.route('/students')
  .get(protect, authorize('admin'), getAllStudents)
  .post(protect, authorize('admin'), createStudent);

router.route('/students/:id')
  .get(protect, authorize('admin'), getStudentById)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

// System Settings
router.route('/settings')
  .get(protect, authorize('admin'), getSystemSettings)
  .put(protect, authorize('admin'), updateSystemSettings);

// Admin Profile
router.put('/change-password', protect, authorize('admin'), changeAdminPassword);

export default router;