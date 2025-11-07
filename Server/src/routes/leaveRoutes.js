import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getDashboardStats
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validateLeave } from '../middleware/validateLeave.js';

const router = express.Router();

// All leave routes require authentication
router.use(authenticate);

// Specific routes must come before parameterized routes
router.get('/my-leaves', getMyLeaves); // Get my leaves (Employee)
router.get('/dashboard/stats', requireAdmin, getDashboardStats); // Dashboard stats (Admin)

// Employee routes
router.post('/', validateLeave, applyLeave); // Apply for leave
router.patch('/:id/cancel', cancelLeave); // Cancel leave

// Admin routes (must come before /:id to avoid conflicts)
router.get('/', requireAdmin, getAllLeaves); // Get all leaves (admin only)
router.patch('/:id/approve', requireAdmin, approveLeave); // Approve leave (admin only)
router.patch('/:id/reject', requireAdmin, rejectLeave); // Reject leave (admin only)

// Common routes (must come after specific routes)
router.get('/:id', getLeaveById); // Get leave by ID
router.put('/:id', validateLeave, updateLeave); // Update leave (only if pending)

export default router;

