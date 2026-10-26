import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuthor extends Document {
  id: string;
  name: string;
  bio?: string;
  designation?: string;
  imageId?: mongoose.Types.ObjectId | null;
  image?: any;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    imageId: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
        if (ret.updatedBy) {
          if (ret.updatedBy instanceof mongoose.Types.ObjectId) {
            ret.updatedBy = ret.updatedBy.toString();
          } else if (typeof ret.updatedBy === 'object' && ret.updatedBy._id) {
            ret.updatedBy.id = ret.updatedBy._id.toString();
            delete ret.updatedBy._id;
          }
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Author: Model<IAuthor> = mongoose.model<IAuthor>('Author', authorSchema);
