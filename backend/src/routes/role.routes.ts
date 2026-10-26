import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { activityLogger } from '../middleware/activityLogger.js';

const router = Router();

// Only Admins can view or manage roles
router.get('/permissions', authenticate, requireAdmin, RoleController.getAvailablePermissions);
router.get('/', authenticate, requireAdmin, RoleController.getRoles);
router.get('/:id', authenticate, requireAdmin, RoleController.getRoleById);
router.post(
  '/',
  authenticate,
  requireAdmin,
  activityLogger('Created Role'),
  RoleController.createRole
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  activityLogger('Updated Role'),
  RoleController.updateRole
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  activityLogger('Deleted Role'),
  RoleController.deleteRole
);

export default router;
