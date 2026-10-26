import { Request, Response } from 'express';
import { PostService } from '../services/post.service.js';
import { ApiResponse } from '../utils/response.js';
import { createPostSchema, updatePostSchema } from '../validations/post.validation.js';
import { AuthRequest } from '../types/index.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';

export class PostController {
  static async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const result = await PostService.getPosts(req.query);
      ApiResponse.paginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const post = await PostService.getPostById(req.params.id);
      ApiResponse.success(res, post);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async getPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      try {
        const post = await PostService.getPostBySlug(req.params.slug);
        ApiResponse.success(res, post);
      } catch (err: any) {
        // Check for 301 redirect
        const newSlug = await PostService.getRedirectBySlug(req.params.slug);
        if (newSlug) {
          res.redirect(301, `/blog/${newSlug}`);
          return;
        }
        ApiResponse.error(res, 'Blog post not found', 404);
      }
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async recordView(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const referrer = (req.body?.referrer || req.headers['referer'] || req.headers['referrer'] || req.query.ref || '') as string;
      const userAgent = (req.headers['user-agent'] || '') as string;
      const updated = await PostService.incrementViews(id, { referrer, userAgent });
      if (!updated) {
        ApiResponse.error(res, 'Blog post not found', 404);
        return;
      }
      ApiResponse.success(res, { views: updated.views, metrics: updated.metrics }, 'View recorded');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createPost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = createPostSchema.validate(req.body, { abortEarly: false });
      if (error) {
        ApiResponse.error(res, error.details.map((d) => d.message).join(', '), 400);
        return;
      }

      const userId = req.user?.id;
      const authorId = req.body.authorId || req.body.author || userId;
      if (!authorId && !userId) {
        ApiResponse.error(res, 'Author ID required', 400);
        return;
      }

      const post = await PostService.createPost(value, authorId, userId);
      ApiResponse.success(res, post, 'Post created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updatePost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = updatePostSchema.validate(req.body, { abortEarly: false });
      if (error) {
        ApiResponse.error(res, error.details.map((d) => d.message).join(', '), 400);
        return;
      }

      const post = await PostService.updatePost(req.params.id, value);
      ApiResponse.success(res, post, 'Post updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deletePost(req: AuthRequest, res: Response): Promise<void> {
    try {
      await PostService.deletePost(req.params.id);
      ApiResponse.success(res, { success: true }, 'Post deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async getRevisions(req: Request, res: Response): Promise<void> {
    try {
      const revisions = await PostService.getRevisions(req.params.id);
      ApiResponse.success(res, revisions);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async restoreRevision(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, revisionId } = req.params;
      const post = await PostService.restoreRevision(id, revisionId);
      ApiResponse.success(res, post, 'Revision restored successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async likePost(req: Request, res: Response): Promise<void> {
    try {
      const post = await PostService.likePost(req.params.id);
      ApiResponse.success(res, post, 'Post liked successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  // ===================== Categories =====================
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await PostService.getAllCategories(req.query);
      ApiResponse.success(res, categories);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await PostService.createCategory(req.body, req.user?.id);
      ApiResponse.success(res, category, 'Category created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await PostService.updateCategory(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, category, 'Category updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      await PostService.deleteCategory(req.params.id);
      ApiResponse.success(res, { success: true }, 'Category deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  // ===================== Authors =====================
  static async getAuthors(req: Request, res: Response): Promise<void> {
    try {
      const authors = await PostService.getAllAuthors(req.query);
      ApiResponse.success(res, authors);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createAuthor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const author = await PostService.createAuthor(req.body, req.user?.id);
      ApiResponse.success(res, author, 'Author created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updateAuthor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const author = await PostService.updateAuthor(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, author, 'Author updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteAuthor(req: AuthRequest, res: Response): Promise<void> {
    try {
      await PostService.deleteAuthor(req.params.id);
      ApiResponse.success(res, { success: true }, 'Author deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  // ===================== Tags =====================
  static async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await PostService.getAllTags(req.query);
      ApiResponse.success(res, tags);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getTagById(req: Request, res: Response): Promise<void> {
    try {
      const tag = await PostService.getTagById(req.params.id);
      ApiResponse.success(res, tag);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async createTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await PostService.createTag(req.body, req.user?.id);
      ApiResponse.success(res, tag, 'Tag created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async updateTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tag = await PostService.updateTag(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, tag, 'Tag updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      await PostService.deleteTag(req.params.id);
      ApiResponse.success(res, { success: true }, 'Tag deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  // ===================== Redirects =====================
  static async getAllRedirects(req: Request, res: Response): Promise<void> {
    try {
      const redirects = await PostService.getAllRedirects();
      ApiResponse.success(res, redirects);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getRedirectMap(req: Request, res: Response): Promise<void> {
    try {
      const map = await PostService.getRedirectMap();
      ApiResponse.success(res, map);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createRedirect(req: AuthRequest, res: Response): Promise<void> {
    try {
      const oldSlug = req.body?.old_slug || req.body?.oldSlug;
      const blogId = req.body?.blog_id || req.body?.blogId;
      if (!oldSlug || !blogId) {
        ApiResponse.error(res, 'old_slug and blog_id are required', 400);
        return;
      }
      await PostService.createRedirect(oldSlug, blogId, req.user?.id);
      ApiResponse.success(res, { success: true }, 'Blog redirect created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteRedirect(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldSlug } = req.params;
      await PostService.deleteRedirect(oldSlug);
      ApiResponse.success(res, { success: true }, 'Blog redirect deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  // ===================== Blog Import =====================
  static async importBlog(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        ApiResponse.error(res, 'No file was uploaded for import', 400);
        return;
      }
      const { BlogImportService } = await import('../services/blogImport.service.js');
      const authorId = req.user?.id || 'admin';
      const post = await BlogImportService.importBlog(req.file, authorId);
      ApiResponse.success(res, post, 'Blog post imported successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async downloadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { BlogImportService } = await import('../services/blogImport.service.js');
      const content = BlogImportService.getWritingGuideTemplate();
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename=blog_writing_template.md');
      res.send(content);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }
}
