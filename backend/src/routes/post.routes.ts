import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  checkPostOwnership,
  requireAdmin,
  checkCategoryOwnership,
  checkAuthorOwnership,
  checkTagOwnership,
  checkRedirectOwnership,
} from '../middleware/rbac.js';
import { activityLogger } from '../middleware/activityLogger.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// ===================== Categories =====================
router.get('/blogs/categories', PostController.getCategories);
router.post('/admin/blogs/categories', authenticate, activityLogger('Created Category'), PostController.createCategory);
router.put('/admin/blogs/categories/:id', authenticate, checkCategoryOwnership, activityLogger('Updated Category'), PostController.updateCategory);
router.delete('/admin/blogs/categories/:id', authenticate, checkCategoryOwnership, activityLogger('Deleted Category'), PostController.deleteCategory);

// ===================== Authors =====================
router.get('/blogs/authors', PostController.getAuthors);
router.post('/admin/blogs/authors', authenticate, activityLogger('Created Author'), PostController.createAuthor);
router.put('/admin/blogs/authors/:id', authenticate, checkAuthorOwnership, activityLogger('Updated Author'), PostController.updateAuthor);
router.delete('/admin/blogs/authors/:id', authenticate, checkAuthorOwnership, activityLogger('Deleted Author'), PostController.deleteAuthor);

// ===================== Tags =====================
router.get('/blogs/tags', PostController.getTags);
router.post('/admin/blogs/tags', authenticate, activityLogger('Created Tag'), PostController.createTag);
router.get('/admin/blogs/tags/:id', authenticate, PostController.getTagById);
router.put('/admin/blogs/tags/:id', authenticate, checkTagOwnership, activityLogger('Updated Tag'), PostController.updateTag);
router.delete('/admin/blogs/tags/:id', authenticate, checkTagOwnership, activityLogger('Deleted Tag'), PostController.deleteTag);

// ===================== Redirects =====================
router.get('/blogs/redirects/map', PostController.getRedirectMap);
router.get('/admin/blogs/redirects', authenticate, PostController.getAllRedirects);
router.post('/admin/blogs/redirects', authenticate, activityLogger('Created Redirect'), PostController.createRedirect);
router.delete('/admin/blogs/redirects/:oldSlug', authenticate, checkRedirectOwnership, activityLogger('Deleted Redirect'), PostController.deleteRedirect);

// ===================== Import Blog Post =====================
router.post('/admin/blogs/import', authenticate, requireAdmin, upload.single('file'), activityLogger('Imported Blog'), PostController.importBlog);
router.get('/admin/blogs/import/template', PostController.downloadTemplate);

// ===================== Revisions =====================
router.get('/admin/blogs/:id/revisions', authenticate, PostController.getRevisions);
router.post(
  '/admin/blogs/:id/revisions/:revisionId/restore',
  authenticate,
  checkPostOwnership,
  activityLogger('Restored Post Revision'),
  PostController.restoreRevision
);

// ===================== Public Blog Posts =====================
router.get('/blogs', PostController.getPosts);
router.get('/blogs/slug/:slug', PostController.getPostBySlug);
router.get('/blogs/:id', PostController.getPostById);
router.post('/blogs/:id/view', PostController.recordView);
router.post('/blogs/:id/like', PostController.likePost);

// ===================== Admin Blog Post Mutations =====================
router.get('/admin/blogs/:id', authenticate, PostController.getPostById);
router.post('/admin/blogs', authenticate, activityLogger('Created Post'), PostController.createPost);
router.put(
  '/admin/blogs/:id',
  authenticate,
  checkPostOwnership,
  activityLogger('Updated Post'),
  PostController.updatePost
);
router.delete(
  '/admin/blogs/:id',
  authenticate,
  checkPostOwnership,
  activityLogger('Deleted Post'),
  PostController.deletePost
);

export default router;
