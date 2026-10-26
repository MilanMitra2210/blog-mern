import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBlogRedirect extends Document {
  id: string;
  oldSlug: string;
  blog: mongoose.Types.ObjectId | any;
  createdBy?: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

const blogRedirectSchema = new Schema<IBlogRedirect>(
  {
    oldSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        if (ret.createdBy) {
          if (ret.createdBy instanceof mongoose.Types.ObjectId) {
            ret.createdBy = ret.createdBy.toString();
          } else if (typeof ret.createdBy === 'object' && ret.createdBy._id) {
            ret.createdBy.id = ret.createdBy._id.toString();
            delete ret.createdBy._id;
          }
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const BlogRedirect: Model<IBlogRedirect> = mongoose.model<IBlogRedirect>('BlogRedirect', blogRedirectSchema);
