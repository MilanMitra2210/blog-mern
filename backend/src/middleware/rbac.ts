import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Media } from '../models/Media.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Tag } from '../models/Tag.js';
import { BlogRedirect } from '../models/BlogRedirect.js';

/**
 * Require one or more specific user roles (e.g. 'ADMIN' or 'USER')
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Forbidden: Role '${req.user.role}' lacks sufficient privileges. Required: [${roles.join(', ')}]`,
        403
      );
      return;
    }

    next();
  };
};

/**
 * Require administrator role specifically
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Verify user management access:
 * - Admins can manage all users
 * - Regular users can only access and update their own account
 */
export const checkUserManagementPermission = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    ApiResponse.error(res, 'Authentication required', 401);
    return;
  }

  // Admins can manage any user account
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Regular users can only access or modify their own user profile
  if (req.params.id && req.user.id === req.params.id) {
    return next();
  }

  ApiResponse.error(res, 'Forbidden: Only administrators can manage other users', 403);
};

/**
 * Verify post ownership per Section 2:
 * - Admins can manage all posts
 * - Regular users can create, edit, and delete only their own posts
 */
export const checkPostOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    // Admins can manage any post
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const { id } = req.params;
    const post = await Post.findOne({ _id: id, isDeleted: false });

    if (!post) {
      ApiResponse.error(res, 'Post not found', 404);
      return;
    }

    const createdById = post.createdBy?._id
      ? post.createdBy._id.toString()
      : (post.createdBy ? post.createdBy.toString() : null);
    const authorId = post.author?._id
      ? post.author._id.toString()
      : (post.author ? post.author.toString() : null);

    const isOwner = createdById === req.user.id || authorId === req.user.id;
    if (!isOwner) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own posts', 403);
      return;
    }

    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify post ownership: ${error.message}`, 500);
  }
};

/**
 * Verify comment ownership per Section 4:
 * - Admins can manage all comments
 * - Regular users can edit and delete only their own comments
 */
export const checkCommentOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    // Admins can manage any comment
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const { id } = req.params;
    const comment = await Comment.findOne({ _id: id, isDeleted: false });

    if (!comment) {
      ApiResponse.error(res, 'Comment not found', 404);
      return;
    }

    const commentUserId = comment.user ? comment.user.toString() : null;
    if (commentUserId !== req.user.id && comment.authorEmail !== req.user.email) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own comments', 403);
      return;
    }

    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify comment ownership: ${error.message}`, 500);
  }
};

/**
 * Granular permission check middleware supporting custom roles and ADMIN overrides
 */
export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    // ADMIN has full access across all operations
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const userPerms = req.user.permissions || [];
    const hasPermission = permissions.some((perm) => userPerms.includes(perm));

    if (!hasPermission) {
      ApiResponse.error(
        res,
        `Forbidden: Insufficient privileges. Required permission: [${permissions.join(', ')}]`,
        403
      );
      return;
    }

    next();
  };
};

/**
 * Verify media ownership:
 * - Admins can manage all media files
 * - Regular users can edit, replace, or delete only their own uploaded media
 */
export const checkMediaOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      ApiResponse.error(res, 'Media not found', 404);
      return;
    }

    const uploaderId = media.uploadedBy ? media.uploadedBy.toString() : null;
    if (uploaderId && uploaderId !== req.user.id) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own uploaded media', 403);
      return;
    }

    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify media ownership: ${error.message}`, 500);
  }
};

export const checkCategoryOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }
    if (req.user.role === 'ADMIN') return next();

    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) {
      ApiResponse.error(res, 'Category not found', 404);
      return;
    }

    const createdByStr = category.createdBy ? category.createdBy.toString() : null;
    if (createdByStr && createdByStr !== req.user.id) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own categories', 403);
      return;
    }
    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify category ownership: ${error.message}`, 500);
  }
};

export const checkAuthorOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }
    if (req.user.role === 'ADMIN') return next();

    const author = await Author.findOne({ _id: req.params.id, isDeleted: false });
    if (!author) {
      ApiResponse.error(res, 'Author not found', 404);
      return;
    }

    const createdByStr = author.createdBy ? author.createdBy.toString() : null;
    if (createdByStr && createdByStr !== req.user.id) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own author profiles', 403);
      return;
    }
    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify author ownership: ${error.message}`, 500);
  }
};

export const checkTagOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }
    if (req.user.role === 'ADMIN') return next();

    const tag = await Tag.findOne({ _id: req.params.id, isDeleted: false });
    if (!tag) {
      ApiResponse.error(res, 'Tag not found', 404);
      return;
    }

    const createdByStr = tag.createdBy ? tag.createdBy.toString() : null;
    if (createdByStr && createdByStr !== req.user.id) {
      ApiResponse.error(res, 'Forbidden: You can only edit or delete your own tags', 403);
      return;
    }
    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify tag ownership: ${error.message}`, 500);
  }
};

export const checkRedirectOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }
    if (req.user.role === 'ADMIN') return next();

    const redirect = await BlogRedirect.findOne({ oldSlug: req.params.oldSlug.trim().toLowerCase() });
    if (!redirect) {
      ApiResponse.error(res, 'Redirect not found', 404);
      return;
    }

    const createdByStr = redirect.createdBy ? redirect.createdBy.toString() : null;
    if (createdByStr && createdByStr !== req.user.id) {
      ApiResponse.error(res, 'Forbidden: You can only delete your own redirects', 403);
      return;
    }
    next();
  } catch (error: any) {
    ApiResponse.error(res, `Failed to verify redirect ownership: ${error.message}`, 500);
  }
};
