import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

// Dashboard general metrics (accessible to authenticated panel users)
router.get('/dashboard/stats', authenticate, DashboardController.getStats);
router.get('/dashboard/analytics/posts', authenticate, DashboardController.getAnalyticsPosts);

// Advanced analytics & real-time monitoring (restricted to Admin)
router.get('/admin/analytics/realtime/stream', DashboardController.realtimeStream);
router.get('/admin/analytics/geo', authenticate, requireAdmin, DashboardController.getGeoMetrics);
router.get('/admin/analytics/utm', authenticate, requireAdmin, DashboardController.getUtmMetrics);
router.get('/admin/analytics/engagement', authenticate, requireAdmin, DashboardController.getEngagementMetrics);

export default router;
