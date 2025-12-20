import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    getWardenDashboardStats, getPendingPassRequests,
    handlePassAction, getMyStudents,
    addStudent, getStudentDetails,
    updateStudentDetails,
    toggleStudentStatus,
    deleteStudent,
    getStudentHistory, getWardenGuards,
    addWardenGuard,
    getWardenGuardDetails,
    updateWardenGuard,
    deleteWardenGuard,
    toggleWardenGuardStatus,
    getWardenProfile,
    updateWardenProfile, getActiveDefaulters,
    clearDefaulterStatus,
    getProfileUpdateRequests,
    handleProfileUpdateAction
} from '../controller/wardenController.js';

const router = express.Router();

// Dashboard Stats
router.get('/dashboard-stats', protect, authorize('warden'), getWardenDashboardStats);
router.get('/pass-requests', protect, authorize('warden'), getPendingPassRequests);
router.put('/pass-requests/:id', protect, authorize('warden'), handlePassAction);
router.route('/students')
    .get(protect, authorize('warden'), getMyStudents)
    .post(protect, authorize('warden'), addStudent);
// Add other routes (e.g., approve pass) here later
router.route('/students/:id')
    .get(protect, authorize('warden'), getStudentDetails)
    .put(protect, authorize('warden'), updateStudentDetails)
    .delete(protect, authorize('warden'), deleteStudent);

router.patch('/students/:id/status', protect, authorize('warden'), toggleStudentStatus);
router.get('/students/:id/history', protect, authorize('warden'), getStudentHistory);

// Security Guard Management
router.route('/guards')
    .get(protect, authorize('warden'), getWardenGuards)
    .post(protect, authorize('warden'), addWardenGuard);

router.route('/guards/:id')
    .get(protect, authorize('warden'), getWardenGuardDetails)
    .put(protect, authorize('warden'), updateWardenGuard)
    .delete(protect, authorize('warden'), deleteWardenGuard);

router.patch('/guards/:id/status', protect, authorize('warden'), toggleWardenGuardStatus);

// Profile Routes
router.route('/profile')
    .get(protect, authorize('warden'), getWardenProfile)
    .put(protect, authorize('warden'), updateWardenProfile);

// Defaulter Management
router.get('/defaulters', protect, authorize('warden'), getActiveDefaulters);
router.put('/defaulters/:id/clear', protect, authorize('warden'), clearDefaulterStatus);

// Profile Update Requests Management
router.route('/profile-requests')
    .get(protect, authorize('warden'), getProfileUpdateRequests);

router.route('/profile-requests/:id')
    .put(protect, authorize('warden'), handleProfileUpdateAction);

export default router;