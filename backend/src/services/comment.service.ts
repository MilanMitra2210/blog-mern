import mongoose from 'mongoose';
import { Comment, IComment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { IUserPayload } from '../types/index.js';
import { emitNotification } from '../socket/index.js';

export class CommentService {
  static async getComments(params: {
    page?: number | string;
    limit?: number | string;
    postId?: string;
    approved?: boolean | string;
    search?: string;
    user?: IUserPayload;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    // Regular users see only comments on their own published/authored posts
    if (params.user && params.user.role !== 'ADMIN' && params.user.id) {
      const validObjectId = mongoose.Types.ObjectId.isValid(params.user.id)
        ? new mongoose.Types.ObjectId(params.user.id)
        : null;
      const userPosts = await Post.find({
        $or: [
          { createdBy: params.user.id },
          { author: params.user.id },
          ...(validObjectId ? [{ createdBy: validObjectId }, { author: validObjectId }] : []),
        ],
        isDeleted: false,
      }).select('_id');
      const userPostIds = userPosts.map((p) => p._id);

      if (params.postId) {
        if (!userPostIds.some((pId) => pId.toString() === params.postId)) {
          return { items: [], total: 0, page, limit };
        }
        query.post = params.postId;
      } else {
        query.post = { $in: userPostIds };
      }
    } else if (params.postId) {
      query.post = params.postId;
    }

    if (params.approved !== undefined && params.approved !== '') {
      query.approved = params.approved === 'true' || params.approved === true;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [{ content: searchRegex }, { authorName: searchRegex }, { authorEmail: searchRegex }];
    }

    const [items, total] = await Promise.all([
      Comment.find(query)
        .populate('post', 'title slug')
        .populate('user', 'name email role image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  static async getPostComments(postId: string) {
    return Comment.find({
      post: postId,
      approved: true,
      isDeleted: false,
    })
      .populate('user', 'name email image')
      .sort({ createdAt: 1 });
  }

  static async createComment(
    data: {
      postId: string;
      content: string;
      authorName?: string;
      authorEmail?: string;
      parentId?: string;
    },
    user?: IUserPayload
  ): Promise<any> {
    const post = await Post.findById(data.postId);
    if (!post) throw new Error('Post not found');

    const comment = await Comment.create({
      post: data.postId,
      user: user ? user.id : null,
      authorName: user ? (user.name || user.email) : (data.authorName || 'Anonymous'),
      authorEmail: user ? user.email : (data.authorEmail || ''),
      content: data.content,
      approved: true, // auto-approve comments by default
      parentId: data.parentId || null,
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    emitNotification('notification:new_comment', {
      post: post.title,
      content: data.content,
    });

    return {
      ...comment.toJSON(),
      postTitle: post.title,
      postSlug: post.slug,
    };
  }

  static async approveComment(id: string) {
    const comment = await Comment.findById(id);
    if (!comment) throw new Error('Comment not found');

    comment.approved = true;
    await comment.save();
    return comment;
  }

  static async updateComment(id: string, content: string) {
    const comment = await Comment.findById(id);
    if (!comment) throw new Error('Comment not found');

    comment.content = content;
    await comment.save();
    return comment;
  }

  static async deleteComment(id: string) {
    const comment = await Comment.findById(id);
    if (!comment) throw new Error('Comment not found');

    comment.isDeleted = true;
    await comment.save();

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    return true;
  }
}
