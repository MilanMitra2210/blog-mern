import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IComment extends Document {
  id: string;
  post: mongoose.Types.ObjectId | any;
  postId?: string;
  user?: mongoose.Types.ObjectId | any;
  authorName: string;
  authorEmail: string;
  content: string;
  approved: boolean;
  parentId?: mongoose.Types.ObjectId | null;
  isAdmin: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    approved: {
      type: Boolean,
      default: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : (ret.id || doc.id);
        if (ret.post) {
          if (typeof ret.post === 'object') {
            ret.postId = ret.post.id ? ret.post.id.toString() : (ret.post._id ? ret.post._id.toString() : '');
            if (ret.post.title) ret.postTitle = ret.post.title;
            if (ret.post.slug) ret.postSlug = ret.post.slug;
          } else {
            ret.postId = ret.post.toString();
          }
        } else {
          ret.postId = '';
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

commentSchema.index({ post: 1, isDeleted: 1, approved: 1, createdAt: -1 });

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
