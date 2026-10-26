import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/response.js';
import { createCommentSchema } from '../validations/comment.validation.js';
import { AuthRequest } from '../types/index.js';

export class CommentController {
  static async getComments(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthRequest).user;
      const result = await CommentService.getComments({ ...req.query, user });
      ApiResponse.paginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getPostComments(req: Request, res: Response): Promise<void> {
    try {
      const comments = await CommentService.getPostComments(req.params.postId);
      ApiResponse.success(res, comments);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { error, value } = createCommentSchema.validate(req.body);
      if (error) {
        ApiResponse.error(res, error.details[0].message, 400);
        return;
      }

      const comment = await CommentService.createComment(value, req.user);
      ApiResponse.success(res, comment, 'Comment submitted successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async approveComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const comment = await CommentService.approveComment(req.params.id);
      ApiResponse.success(res, comment, 'Comment approved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async updateComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const content = req.body?.content;
      if (!content || !content.trim()) {
        ApiResponse.error(res, 'Content is required to update comment', 400);
        return;
      }
      const comment = await CommentService.updateComment(req.params.id, content.trim());
      ApiResponse.success(res, comment, 'Comment updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      await CommentService.deleteComment(req.params.id);
      ApiResponse.success(res, { success: true }, 'Comment deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }
}
