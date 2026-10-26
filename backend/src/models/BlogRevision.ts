import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBlogRevision extends Document {
  id: string;
  blogId: mongoose.Types.ObjectId | string;
  title: string;
  excerpt?: string;
  sections_data?: any[];
  revisionNumber: number;
  createdAt: Date;
}

const blogRevisionSchema = new Schema<IBlogRevision>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: '',
    },
    sections_data: {
      type: Schema.Types.Mixed,
      default: [],
    },
    revisionNumber: {
      type: Number,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        if (ret.blogId) ret.blogId = ret.blogId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const BlogRevision: Model<IBlogRevision> = mongoose.model<IBlogRevision>(
  'BlogRevision',
  blogRevisionSchema
);
