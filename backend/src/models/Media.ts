import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMedia extends Document {
  id: string;
  name: string;
  url: string;
  altText: string;
  size: number;
  mimeType: string;
  folderId?: mongoose.Types.ObjectId | null;
  uploadedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'image/jpeg',
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true,
    },
    uploadedBy: {
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Media: Model<IMedia> = mongoose.model<IMedia>('Media', mediaSchema);
