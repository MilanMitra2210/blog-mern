import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, checkUserManagementPermission } from '../middleware/rbac.js';
import { activityLogger } from '../middleware/activityLogger.js';

const router = Router();

// Per Section 2: Admins can manage all users
router.get('/', authenticate, requireAdmin, UserController.getUsers);
router.post(
  '/',
  authenticate,
  requireAdmin,
  activityLogger('Created User'),
  UserController.createUser
);

// Admins can manage any user; regular users can access/update only their own account
router.get('/:id', authenticate, checkUserManagementPermission, UserController.getUserById);
router.put(
  '/:id',
  authenticate,
  checkUserManagementPermission,
  activityLogger('Updated User'),
  UserController.updateUser
);

// Only Admins can delete users
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  activityLogger('Deleted User'),
  UserController.deleteUser
);

export default router;
