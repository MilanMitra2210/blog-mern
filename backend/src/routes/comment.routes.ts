import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { checkCommentOwnership, requireAdmin } from '../middleware/rbac.js';
import { activityLogger } from '../middleware/activityLogger.js';

const router = Router();

// Public comments for a blog post
router.get('/comments/post/:postId', CommentController.getPostComments);
router.post('/comments', optionalAuth, activityLogger('Submitted Comment'), CommentController.createComment);

router.get('/admin/comments', authenticate, CommentController.getComments);
router.put(
  '/admin/comments/:id/approve',
  authenticate,
  requireAdmin,
  activityLogger('Approved Comment'),
  CommentController.approveComment
);
router.put(
  '/comments/:id',
  authenticate,
  checkCommentOwnership,
  activityLogger('Updated Comment'),
  CommentController.updateComment
);
router.delete(
  '/comments/:id',
  authenticate,
  checkCommentOwnership,
  activityLogger('Deleted Comment'),
  CommentController.deleteComment
);
router.delete(
  '/admin/comments/:id',
  authenticate,
  checkCommentOwnership,
  activityLogger('Deleted Comment'),
  CommentController.deleteComment
);

export default router;
