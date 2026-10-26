import mongoose from 'mongoose';
import { Media, IMedia } from '../models/Media.js';
import { Folder } from '../models/Folder.js';

export class MediaService {
  static async getMedia(params: {
    folderId?: string;
    folder_id?: string;
    search?: string;
    page?: number | string;
    limit?: number | string;
    user?: any;
    userId?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    const skip = (page - 1) * limit;

    const query: any = {};
    const folderId = params.folderId || params.folder_id;
    if (folderId && folderId !== 'all') {
      query.folderId = folderId;
    }
    if (params.search) {
      query.name = new RegExp(params.search.trim(), 'i');
    }

    const user = params.user;
    const targetUserId = user && user.role !== 'ADMIN' ? user.id : params.userId;
    if (targetUserId) {
      const validObjectId = mongoose.Types.ObjectId.isValid(targetUserId)
        ? new mongoose.Types.ObjectId(targetUserId)
        : null;
      query.$or = [{ uploadedBy: targetUserId }, ...(validObjectId ? [{ uploadedBy: validObjectId }] : [])];
    }

    const [items, total, folders] = await Promise.all([
      Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(query),
      Folder.find().sort({ name: 1 }),
    ]);

    return {
      files: items,
      folders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async uploadMedia(file: Express.Multer.File, folderId?: string, altText?: string, userId?: string) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const media = await Media.create({
      name: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      altText: altText || file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      folderId: folderId && folderId !== '' ? folderId : null,
      uploadedBy: userId || null,
    });
    return media;
  }

  static async uploadBulk(files: Express.Multer.File[], folderId?: string, userId?: string) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const docs = files.map((file) => ({
      name: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      altText: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      folderId: folderId && folderId !== '' ? folderId : null,
      uploadedBy: userId || null,
    }));
    return Media.insertMany(docs);
  }

  static async updateMedia(id: string, updates: { name?: string; altText?: string; folderId?: string | null }) {
    const media = await Media.findById(id);
    if (!media) throw new Error('Media not found');

    if (updates.name !== undefined) media.name = updates.name;
    if (updates.altText !== undefined) media.altText = updates.altText;
    if (updates.folderId !== undefined) {
      media.folderId = (updates.folderId && updates.folderId !== '') ? (updates.folderId as any) : null;
    }

    await media.save();
    return media;
  }

  static async replaceMedia(id: string, file: Express.Multer.File) {
    const media = await Media.findById(id);
    if (!media) throw new Error('Media not found');

    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    media.name = file.originalname;
    media.url = `${baseUrl}/uploads/${file.filename}`;
    media.size = file.size;
    media.mimeType = file.mimetype;

    await media.save();
    return media;
  }

  static async bulkMove(mediaIds: string[], folderId: string | null) {
    const targetFolder = folderId && folderId !== '' ? folderId : null;
    await Media.updateMany(
      { _id: { $in: mediaIds } },
      { $set: { folderId: targetFolder } }
    );
    return { success: true };
  }

  static async deleteMedia(id: string) {
    const media = await Media.findByIdAndDelete(id);
    return !!media;
  }

  static async getFolders() {
    return Folder.find().sort({ name: 1 });
  }

  static async createFolder(name: string, parentId?: string | null) {
    return Folder.create({
      name,
      parentId: parentId && parentId !== '' ? parentId : null,
    });
  }

  static async deleteFolder(id: string) {
    return Folder.findByIdAndDelete(id);
  }
}

