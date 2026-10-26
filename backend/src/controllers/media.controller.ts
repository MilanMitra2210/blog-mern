import { Request, Response } from 'express';
import { MediaService } from '../services/media.service.js';
import { ApiResponse } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export class MediaController {
  static async getMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await MediaService.getMedia({
        ...req.query,
        user: req.user,
        userId: (req.query as any)?.userId,
      });
      ApiResponse.success(res, result);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async uploadMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        ApiResponse.error(res, 'No file was uploaded', 400);
        return;
      }

      const folderId = req.body?.folder_id || req.body?.folderId;
      const altText = req.body?.alt_text || req.body?.altText;
      const media = await MediaService.uploadMedia(req.file, folderId, altText, req.user?.id);
      ApiResponse.success(res, media, 'Media uploaded successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async uploadBulk(req: AuthRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        ApiResponse.error(res, 'No files were uploaded', 400);
        return;
      }

      const folderId = req.body?.folder_id || req.body?.folderId;
      const result = await MediaService.uploadBulk(files, folderId, req.user?.id);
      ApiResponse.success(res, result, 'Media bulk uploaded successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async updateMedia(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const name = req.body?.name;
      const altText = req.body?.alt_text ?? req.body?.altText;
      const folderId = req.body?.folder_id ?? req.body?.folderId;
      const media = await MediaService.updateMedia(id, { name, altText, folderId });
      ApiResponse.success(res, media, 'Media updated successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async replaceMedia(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        ApiResponse.error(res, 'No file was uploaded for replacement', 400);
        return;
      }
      const media = await MediaService.replaceMedia(req.params.id, req.file);
      ApiResponse.success(res, media, 'Media replaced successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async bulkMove(req: Request, res: Response): Promise<void> {
    try {
      const mediaIds = req.body?.media_ids || req.body?.mediaIds || [];
      const folderId = req.body?.folder_id ?? req.body?.folderId ?? null;
      const result = await MediaService.bulkMove(mediaIds, folderId);
      ApiResponse.success(res, result, 'Media moved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      await MediaService.deleteMedia(req.params.id);
      ApiResponse.success(res, { success: true }, 'Media deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }

  static async getFolders(req: Request, res: Response): Promise<void> {
    try {
      const folders = await MediaService.getFolders();
      ApiResponse.success(res, folders);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const name = req.body?.name || req.query?.name;
      const parentId = req.body?.parentId || req.body?.parent_id || req.query?.parentId || req.query?.parent_id;
      if (!name) {
        ApiResponse.error(res, 'Folder name is required', 400);
        return;
      }
      const folder = await MediaService.createFolder(String(name), parentId ? String(parentId) : undefined);
      ApiResponse.success(res, folder, 'Folder created successfully', 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 400);
    }
  }

  static async deleteFolder(req: Request, res: Response): Promise<void> {
    try {
      await MediaService.deleteFolder(req.params.id);
      ApiResponse.success(res, { success: true }, 'Folder deleted successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 404);
    }
  }
}
