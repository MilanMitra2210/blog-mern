import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import mediaRoutes from './media.routes.js';
import roleRoutes from './role.routes.js';

const router = Router();

// Auth routes (registered at both /auth/... and /users/...)
router.use('/auth', authRoutes);
router.use('/users', authRoutes);

// User management routes
router.use('/users', userRoutes);

// Roles & Permissions administration
router.use('/admin/roles', roleRoutes);

// Blog posts & categories & tags
router.use('/', postRoutes);

// Comments
router.use('/', commentRoutes);

// Dashboard & Analytics
router.use('/', dashboardRoutes);

// Media
router.use('/', mediaRoutes);

export default router;
