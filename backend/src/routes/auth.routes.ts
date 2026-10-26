import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { activityLogger } from '../middleware/activityLogger.js';

const router = Router();

router.post('/register', authRateLimiter, activityLogger('User Registered'), AuthController.register);
router.post('/login', authRateLimiter, activityLogger('User Logged In'), AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/social/google', authRateLimiter, activityLogger('Google Login'), AuthController.socialGoogle);
router.post('/social/facebook', authRateLimiter, activityLogger('Facebook Login'), AuthController.socialFacebook);
router.post('/logout', authenticate, activityLogger('User Logged Out'), AuthController.logout);
router.post('/change-password', authenticate, activityLogger('Changed Password'), AuthController.changePassword);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, AuthController.resetPassword);

export default router;
