import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITag extends Document {
  id: string;
  name: string;
  slug: string;
  isDeleted: boolean;
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
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

export const Tag: Model<ITag> = mongoose.model<ITag>('Tag', tagSchema);
